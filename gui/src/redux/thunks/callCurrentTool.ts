import { createAsyncThunk, unwrapResult } from "@reduxjs/toolkit";
import { ContextItem } from "core";
import { CLIENT_TOOLS_IMPLS } from "core/tools/builtIn";
import posthog from "posthog-js";
import { callClientTool } from "../../util/clientTools/callClientTool";
import { selectCurrentToolCall } from "../selectors/selectCurrentToolCall";
import { selectSelectedChatModel } from "../slices/configSlice";
import {
  acceptToolCall,
  errorToolCall,
  setToolCallCalling,
  updateToolCallOutput,
} from "../slices/sessionSlice";
import { ThunkApiType } from "../store";
import { streamResponseAfterToolCall } from "./streamResponseAfterToolCall";

// Enhanced error categorization for better agent understanding
const categorizeError = (error: string, toolName: string): string => {
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('permission') || lowerError.includes('access denied')) {
    return `Permission Error: The tool "${toolName}" requires permission to perform this action. This might be due to security settings or file permissions. Consider using a different approach or requesting user permission.`;
  }
  
  if (lowerError.includes('not found') || lowerError.includes('no such file')) {
    return `File Not Found: The requested file or directory doesn't exist. Please verify the path is correct and use file exploration tools (ls_tool, grep_search) to find the correct location.`;
  }
  
  if (lowerError.includes('syntax error') || lowerError.includes('invalid syntax')) {
    return `Syntax Error: There's a syntax error in the code or command. Please review the syntax and try again with corrected format.`;
  }
  
  if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
    return `Timeout Error: The operation took too long to complete. Try breaking it into smaller steps or using a more specific approach.`;
  }
  
  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return `Network Error: There was a network connectivity issue. Please check your connection and try again.`;
  }
  
  return `Tool Error: ${toolName} failed with: ${error}. Please analyze the error and try a different approach.`;
};

export const callCurrentTool = createAsyncThunk<void, undefined, ThunkApiType>(
  "chat/callTool",
  async (_, { dispatch, extra, getState }) => {
    const state = getState();
    const toolCallState = selectCurrentToolCall(state);

    if (!toolCallState) {
      return;
    }

    if (toolCallState.status !== "generated") {
      return;
    }

    const selectedChatModel = selectSelectedChatModel(state);

    if (!selectedChatModel) {
      throw new Error("No model selected");
    }

    const { toolCallId } = toolCallState;
    const toolName = toolCallState.toolCall.function.name;

    dispatch(
      setToolCallCalling({
        toolCallId,
      }),
    );

    let output: ContextItem[] | undefined = undefined;
    let errorMessage: string | undefined = undefined;
    let streamResponse: boolean;

    // Check if telemetry is enabled
    const allowAnonymousTelemetry = state.config.config.allowAnonymousTelemetry;

    // Enhanced error tracking
    let executionStartTime = Date.now();
    let toolExecutionMetrics = {
      toolName,
      startTime: executionStartTime,
      endTime: 0,
      duration: 0,
      success: false,
      errorType: null as string | null,
    };

    try {
      // IMPORTANT:
      // Errors that occur while calling tool call implementations
      // Are caught and passed in output as context items
      // Errors that occur outside specifically calling the tool
      // Should not be caught here - should be handled as normal stream errors
      if (
        CLIENT_TOOLS_IMPLS.find(
          (toolName) => toolName === toolCallState.toolCall.function.name,
        )
      ) {
        // Tool is called on client side
        const {
          output: clientToolOuput,
          respondImmediately,
          errorMessage: clientToolError,
        } = await callClientTool(toolCallState, {
          dispatch,
          ideMessenger: extra.ideMessenger,
          streamId: state.session.codeBlockApplyStates.states.find(
            (state) =>
              state.toolCallId && state.toolCallId === toolCallState.toolCallId,
          )?.streamId,
          getState,
        });
        output = clientToolOuput;
        errorMessage = clientToolError;
        streamResponse = respondImmediately;
      } else {
        // Tool is called on core side
        const result = await extra.ideMessenger.request("tools/call", {
          toolCall: toolCallState.toolCall,
        });
        if (result.status === "error") {
          throw new Error(result.error);
        } else {
          output = result.content.contextItems;
          errorMessage = result.content.errorMessage;
        }
        streamResponse = true;
      }

      // Update metrics
      toolExecutionMetrics.endTime = Date.now();
      toolExecutionMetrics.duration = toolExecutionMetrics.endTime - toolExecutionMetrics.startTime;
      toolExecutionMetrics.success = !errorMessage;

      if (errorMessage) {
        toolExecutionMetrics.errorType = categorizeError(errorMessage, toolName);
        
        // Enhanced error context with suggestions
        const enhancedError = categorizeError(errorMessage, toolName);
        
        dispatch(
          updateToolCallOutput({
            toolCallId,
            contextItems: [
              {
                icon: "problems",
                name: "Tool Call Error",
                description: `${toolName} failed`,
                content: `${enhancedError}\n\n**Original Error:** ${errorMessage}\n\n**Suggestions:**\n- Try a different approach or tool\n- Verify the inputs are correct\n- Check if you have the necessary permissions\n- Consider breaking the task into smaller steps`,
                hidden: false,
              },
            ],
          }),
        );
      } else if (output?.length) {
        // Add execution time info for performance monitoring
        const performanceInfo = toolExecutionMetrics.duration > 5000 
          ? `\n\n*Note: This operation took ${Math.round(toolExecutionMetrics.duration / 1000)}s to complete.*`
          : '';
        
        // Enhance output with metadata if helpful
        const enhancedOutput = output.map((item, index) => ({
          ...item,
          content: index === 0 && performanceInfo ? item.content + performanceInfo : item.content,
        }));

        dispatch(
          updateToolCallOutput({
            toolCallId,
            contextItems: enhancedOutput,
          }),
        );
      }

      // Because we don't have access to use hooks, we check `allowAnonymousTelemetry`
      // directly rather than using `CustomPostHogProvider`
      if (allowAnonymousTelemetry) {
        // Enhanced telemetry with performance metrics
        posthog.capture("gui_tool_call_outcome", {
          succeeded: errorMessage === undefined,
          toolName: toolCallState.toolCall.function.name,
          errorMessage: errorMessage,
          duration: toolExecutionMetrics.duration,
          errorType: toolExecutionMetrics.errorType,
        });
      }

      if (streamResponse) {
        if (errorMessage) {
          dispatch(
            errorToolCall({
              toolCallId,
            }),
          );
        } else {
          dispatch(
            acceptToolCall({
              toolCallId,
            }),
          );
        }

        // Send to the LLM to continue the conversation
        const wrapped = await dispatch(
          streamResponseAfterToolCall({
            toolCallId,
          }),
        );
        unwrapResult(wrapped);
      }
    } catch (error) {
      // Handle unexpected errors
      toolExecutionMetrics.endTime = Date.now();
      toolExecutionMetrics.duration = toolExecutionMetrics.endTime - toolExecutionMetrics.startTime;
      toolExecutionMetrics.success = false;
      toolExecutionMetrics.errorType = 'unexpected_error';
      
      const errorStr = error instanceof Error ? error.message : String(error);
      const enhancedError = categorizeError(errorStr, toolName);
      
      dispatch(
        updateToolCallOutput({
          toolCallId,
          contextItems: [
            {
              icon: "problems",
              name: "Unexpected Tool Error",
              description: `${toolName} encountered an unexpected error`,
              content: `${enhancedError}\n\n**This was an unexpected error. Please try:**\n- Using a different tool or approach\n- Simplifying your request\n- Checking if the operation is supported`,
              hidden: false,
            },
          ],
        }),
      );

      if (allowAnonymousTelemetry) {
        posthog.capture("gui_tool_call_unexpected_error", {
          toolName,
          errorMessage: errorStr,
          duration: toolExecutionMetrics.duration,
        });
      }

      dispatch(
        errorToolCall({
          toolCallId,
        }),
      );

      // Continue the conversation even after unexpected errors
      const wrapped = await dispatch(
        streamResponseAfterToolCall({
          toolCallId,
        }),
      );
      unwrapResult(wrapped);
    }
  },
);

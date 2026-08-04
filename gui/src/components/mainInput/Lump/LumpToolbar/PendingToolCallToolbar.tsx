import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { callCurrentTool } from "../../../../redux/thunks/callCurrentTool";
import { cancelCurrentToolCall } from "../../../../redux/thunks/cancelCurrentToolCall";
import { selectCurrentToolCall } from "../../../../redux/selectors/selectCurrentToolCall";
import {
  getAltKeyLabel,
  getFontSize,
  getMetaKeyLabel,
  isJetBrains,
} from "../../../../util";
import { EnterButton } from "../../InputToolbar/EnterButton";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ToolInfo = styled.div`
  font-size: ${getFontSize() - 2}px;
  color: var(--vscode-descriptionForeground);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ToolName = styled.span`
  font-weight: 500;
  color: var(--vscode-foreground);
`;

const StopButton = styled.div`
  font-size: ${getFontSize() - 3}px;
  padding: 2px;
  padding-right: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const StatusIndicator = styled.div<{ status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'generated': return '#ffa500'; // Orange for pending
      case 'calling': return '#007acc'; // Blue for in progress
      case 'done': return '#28a745'; // Green for success
      case 'error': return '#dc3545'; // Red for error
      default: return '#6c757d'; // Gray for unknown
    }
  }};
  animation: ${props => props.status === 'calling' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

export function PendingToolCallToolbar() {
  const dispatch = useAppDispatch();
  const jetbrains = isJetBrains();
  const toolCallState = useAppSelector(selectCurrentToolCall);

  if (!toolCallState) {
    return null;
  }

  const toolName = toolCallState.toolCall.function.name;
  const status = toolCallState.status;
  
  // Parse tool arguments for better display
  let toolDescription = toolName;
  try {
    const args = JSON.parse(toolCallState.toolCall.function.arguments || '{}');
    if (args.path || args.file) {
      toolDescription = `${toolName}(${args.path || args.file})`;
    } else if (args.query) {
      toolDescription = `${toolName}("${args.query.substring(0, 30)}${args.query.length > 30 ? '...' : ''}")`;
    } else if (args.command) {
      toolDescription = `${toolName}("${args.command.substring(0, 30)}${args.command.length > 30 ? '...' : ''}")`;
    }
  } catch (e) {
    // Use default if parsing fails
  }

  const getStatusText = () => {
    switch (status) {
      case 'generated':
        return 'Pending approval';
      case 'calling':
        return 'Executing...';
      case 'done':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown status';
    }
  };

  const canExecute = status === 'generated';
  const canCancel = status === 'generated' || status === 'calling';

  return (
    <Container>
      <StatusContainer>
        <div className="text-description flex flex-row items-center pb-0.5 pr-1 text-xs">
          <span className="hidden sm:flex">Tool Call</span>
          <span className="sm:hidden">Tool</span>
        </div>
        <ToolInfo>
          <StatusIndicator status={status} />
          <ToolName>{toolDescription}</ToolName>
          <span>• {getStatusText()}</span>
        </ToolInfo>
      </StatusContainer>

      <div className="flex gap-2 pb-0.5">
        {canCancel && (
          <StopButton
            className="text-description"
            onClick={() => dispatch(cancelCurrentToolCall())}
            data-testid="reject-tool-call-button"
            title={status === 'calling' ? 'Cancel execution' : 'Reject tool call'}
          >
            {/* JetBrains overrides cmd+backspace, so we have to use another shortcut */}
            {jetbrains ? getAltKeyLabel() : getMetaKeyLabel()} ⌫ {status === 'calling' ? 'Cancel' : 'Reject'}
          </StopButton>
        )}
        {canExecute && (
          <EnterButton
            isPrimary={true}
            className="text-description"
            onClick={() => dispatch(callCurrentTool())}
            data-testid="accept-tool-call-button"
            title="Execute tool call"
          >
            {getMetaKeyLabel()} ⏎ Execute
          </EnterButton>
        )}
      </div>
    </Container>
  );
}

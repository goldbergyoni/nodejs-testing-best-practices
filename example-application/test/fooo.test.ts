import { randomBytes } from 'crypto';
import 'jest-extended';

// Test helper
function buildWorkflowPreviewResponse(
  ...workflows: { workflowType: string; status: string }[]
) {
  const idsMap: Record<string, any> = {};

  for (let index = 0; index < workflows.length; index++) {
    const workflow = workflows[index];
    const randomId = randomBytes(16).toString('hex');
    idsMap[randomId] = {
      WorkflowExcution: {
        WorkflowType: workflow.workflowType,
        status: workflow.status,
      },
      originKey: null,
      originWorkflowType: null,
    };
  }

  return {
    rootId: expect.any(String),
    idsMap,
  };
}

function buildWorkflowExecution(workflowExecution: {
  workflowType: string;
  status: string;
}) {
  return {
    WorkflowExcution: {
      WorkflowType: workflowExecution.workflowType,
      status: workflowExecution.status,
    },
    originKey: null,
    originWorkflowType: null,
  };
}

const codeUnderTest = () => {
  return {
    rootId: '123e4567-e89b-12d3-a456-426614174000',
    idsMap: {
      // Note: this is random uuid
      '123e4567-e89b-12d3-a456-426614172000': {
        WorkflowExcution: {
          WorkflowType: 'trustee',
          status: 'Draft',
        },
        originKey: null,
        originWorkflowType: null,
      },
      // Note: this is random uuid
      '762e4567-e89b-12d3-a456-426614172000': {
        WorkflowExcution: {
          WorkflowType: 'award-letter',
          status: 'Draft',
        },
        originKey: null,
        originWorkflowType: null,
      },
    },
  };
};

test('foo', () => {
  // Arrange

  //Act
  const receivedResult = codeUnderTest();

  // Assert
  const workflowExecutions = Object.values(receivedResult.idsMap);
  expect(workflowExecutions).toIncludeAllPartialMembers([
    buildWorkflowExecution({ workflowType: 'award-letter', status: 'Draft' }),
    buildWorkflowExecution({ workflowType: 'trustee', status: 'Draft' }),
    
  ]);
});

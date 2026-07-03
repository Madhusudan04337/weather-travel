import { toast } from "sonner";
import type { FulfillmentTask, TravelRequest } from "../../types/travel-request";
import { useCreateFulfillmentTasks, useCompleteTask } from "../../hooks/useTravelRequests";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface FulfillmentTasksCardProps {
  request: TravelRequest;
}

export function FulfillmentTasksCard({ request }: FulfillmentTasksCardProps) {
  const createTasksMutation = useCreateFulfillmentTasks();
  const completeTaskMutation = useCompleteTask();

  const handleCreateTasks = () => {
    createTasksMutation.mutate(request.id, {
      onSuccess: () => toast.success("Fulfillment tasks created."),
      onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to create tasks."),
    });
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(
      { requestId: request.id, taskId },
      {
        onSuccess: (data) => {
          if (data.status === "Closed") {
            toast.success("All tasks completed — request closed and closure email simulated.");
          } else {
            toast.success("Task marked as completed.");
          }
        },
        onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to complete task."),
      }
    );
  };

  const tasks: FulfillmentTask[] = request.tasks || [];
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const isAllDone = tasks.length > 0 && completedCount === tasks.length;

  return (
    <div className="rounded-card border border-border bg-surface shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <div className="flex items-center justify-between">
          <h3 className="text-body-l font-semibold leading-none tracking-tight flex items-center gap-2">
            <span>📋</span> Fulfillment Tasks
          </h3>
          {tasks.length > 0 && (
            <span className="text-caption text-text-muted">
              {completedCount}/{tasks.length} done
            </span>
          )}
        </div>
        {isAllDone && (
          <p className="text-body-sm text-success font-medium pt-1">
            ✅ All tasks complete — closure email simulated.
          </p>
        )}
      </div>

      <div className="p-6 pt-4 flex flex-col gap-3">
        {tasks.length === 0 && request.status === "Approved" && (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-text-secondary">
              No fulfillment tasks yet. Create the standard checklist to begin processing this request.
            </p>
            <Button
              size="sm"
              onClick={handleCreateTasks}
              isLoading={createTasksMutation.isPending}
              disabled={createTasksMutation.isPending}
            >
              Create Tasks
            </Button>
          </div>
        )}

        {tasks.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {tasks.map((task) => {
              const isDone = task.status === "Completed";
              const isThisCompleting =
                completeTaskMutation.isPending &&
                completeTaskMutation.variables?.taskId === task.id;

              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                    isDone
                      ? "bg-success/5 border-success/20"
                      : "bg-background border-border"
                  )}
                >
                  {/* Checkbox area */}
                  <button
                    onClick={() => !isDone && handleCompleteTask(task.id)}
                    disabled={isDone || isThisCompleting}
                    aria-label={isDone ? `${task.title} completed` : `Complete ${task.title}`}
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      isDone
                        ? "bg-success border-success text-white"
                        : "border-border hover:border-brand",
                      "disabled:cursor-default"
                    )}
                  >
                    {isDone && (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {isThisCompleting && (
                      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-body-sm font-medium",
                      isDone ? "text-success line-through" : "text-text-primary"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-caption text-text-muted mt-0.5">{task.description}</p>
                    {isDone && task.completed_at && (
                      <p className="text-caption text-success mt-1">
                        Completed {new Date(task.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {tasks.length === 0 && request.status !== "Approved" && (
          <p className="text-body-sm text-text-muted">
            Fulfillment tasks are created after the request is approved.
          </p>
        )}
      </div>
    </div>
  );
}

import { type TodoType } from "@/type";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import { Trash, SquarePen } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import CreateAndEditTodoForm from "./CreateAndEditTodoorm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useTodo } from "@/contexts/TodoContext";
import {useState} from "react"

const TodoCard = ({ todoDetail }: { todoDetail: TodoType }) => {
  const { refetch } = useTodo();
  const [formVisibility, setFormVisibility] = useState(false);
  const { mutate: markAsDone } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(
        `/todos/${todoDetail.id}/complete`
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
      toast("Todo marked as done!", {
        description: "You have successfully marked the todo as done.",
      });
    },
  });

  const { mutate: deleteTodo } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/todos/${todoDetail.id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      toast("Todo deleted successfully!", {
        description: "You have successfully deleted the todo.",
      });
    },
  });

  return (
    <Card className="w-full max-w-sm min-h-[12rem] backdrop-blur-lg bg-white/10 border-neutral-600 justify-between">
      <CardContent className="h-full">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{todoDetail.title}</CardTitle>
          <CardAction>
            <Button onClick={() => markAsDone()} variant="outline">
              {todoDetail.completed ? "Unmark as Done" : "Mark as Done"}
            </Button>
          </CardAction>
        </div>
        <CardDescription className="text-neutral-300 mt-2">
          {todoDetail.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2 items-center h-full w-full self-end">
        <div className="flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-500 text-white hover:bg-red-600 hover:text-white hover:cursor-pointer">
                <Trash />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-lg backdrop-blur-3xl bg-transparent border-neutral-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer"
                  onClick={() => deleteTodo()}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Dialog open={formVisibility} onOpenChange={(open) => setFormVisibility(open)}>
          <DialogTrigger asChild>
            <Button
              className="hover:cursor-pointer hover:scale-105 transition"
              variant="outline"
            >
              <SquarePen />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg backdrop-blur-3xl bg-transparent border-neutral-600">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Task</DialogTitle>
              <DialogDescription>
                Edit the details of your task.
              </DialogDescription>
            </DialogHeader>
            <CreateAndEditTodoForm setFormVisibility={setFormVisibility} details={todoDetail} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default TodoCard;

import type { TodoType } from "@/type";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useTodo } from "@/contexts/TodoContext";

interface FormProps {
  title: string;
  description: string;
}

const schema = z.object({
  title: z.string().min(2).max(100),
  description: z
    .string()
    .nonempty("Description is required")
    .min(3, "Description must be at least 3 characters long"),
});

const CreateAndEditTodoForm = ({ details, setFormVisibility }: { details?: TodoType, setFormVisibility: (value: boolean) => void }) => {
  const {refetch} = useTodo()
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: details?.title || "",
      description: details?.description || "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (newTodo: FormProps) => {
      const response = await apiClient.post("/todos", newTodo);
      return response.data;
    },
    onSuccess: () => {
      setFormVisibility(false)
      refetch()
      toast("Todo created successfully!", {
        description: "Your new todo has been created.",
      });
      form.reset();
    },
  });

  const { mutateAsync: editTodo } = useMutation({
    mutationFn: async (updatedTodo: FormProps) => {
      const response = await apiClient.put(
        `/todos/${details?.id}`,
        updatedTodo
      );
      return response.data;
    },
    onSuccess: () => {
      refetch()
      setFormVisibility(false)
      toast("Todo updated successfully!", {
        description: "Your todo has been updated.",
      });
      form.reset();
    },
  });

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    if (details) {
      await editTodo(data);
    } else {
      await mutateAsync(data);
    }
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-3">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Title</FormLabel>
                  <FormControl>
                    <Input
                      className="text-white"
                      placeholder="Enter task title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-3">
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Input
                      className="text-white"
                      placeholder="Enter task description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            className="bg-white mt-2 hover:text-black cursor-pointer hover:bg-white text-black"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateAndEditTodoForm;

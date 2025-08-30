import Layout from "@/components/Layout";
import { Plus } from "lucide-react";
import TodoCard from "@/components/TodoCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateAndEditTodoForm from "@/components/CreateAndEditTodoorm";
import { useTodo } from "@/contexts/TodoContext";
import {useState} from "react"

function HomePage() {
  const { todos } = useTodo();
  const [formVisibility, setFormVisibility] = useState(false)

  return (
    <Layout>
      <section className="flex justify-center w-full p-4 h-full gap-2  overflow-y-auto">
        <div className="w-full items-center justify-center flex gap-2 flex-wrap">
          {todos.length > 0 && (
            todos.map((task) => <TodoCard key={task.id} todoDetail={task} />)
          )}
          <Dialog open={formVisibility} onOpenChange={(open) => setFormVisibility(open)}>
            <DialogTrigger
              asChild
              className="w-full max-w-sm backdrop-blur-lg min-h-[12rem] bg-white/10 border border-neutral-700 hover:cursor-pointer hover:bg-white/20 transition rounded-xl"
            >
              <div className="flex justify-center items-center">
                <Plus className="text-white w-10 h-10" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg backdrop-blur-3xl bg-transparent border-neutral-600">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your todo list.
                </DialogDescription>
              </DialogHeader>
              <CreateAndEditTodoForm setFormVisibility={setFormVisibility} />
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </Layout>
  );
}

export default HomePage;

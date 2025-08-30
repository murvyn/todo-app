import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import z from "zod";

interface LoginForm {
  email: string;
  password: string;
}

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const LoginPage = () => {
  const { login } = useAuth();  
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    await login(data.email, data.password);
  };
  return (
    <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg backdrop-blur-3xl  border border-neutral-700">
        <h1 className="text-2xl font-bold text-white mb-6">Login</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-3">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        className="text-white"
                        placeholder="Enter your email"
                        type="email"
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
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input
                        className="text-white"
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Link to="/forgot-password" className="underline text-white mb-2">
              forgot password
            </Link>
            <Button
              className="bg-white mt-2 hover:text-black cursor-pointer hover:bg-white text-black w-full"
              type="submit"
            >
              Login
            </Button>
            <p className="text-white mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;

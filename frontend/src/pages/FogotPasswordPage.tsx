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
import { apiClient } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

interface ForgotPasswordForm {
  email: string;
}

const schema = z.object({
  email: z.string().email(),
});

const ForgotPasswordPage = () => {
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const { mutateAsync: forgotPassword, isPending } = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiClient.post("/auth/forgot-password", {
        email: data.email,
      });
      return response.data;
    },
    onSuccess: () => {
      toast("Success", {
        description: "Password reset email sent successfully.",
      });
    },
    onError: (error) => {
      console.error("Error sending password reset email:", error);

      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message || "An unexpected error occurred.";

        switch (status) {
          case 400:
            toast.error("Invalid Request", message);
            break;
          case 500:
            toast.error(
              "Something went wrong on our end. Please try again later."
            );
            break;
          default:
            toast.error(
              "Failed to send password reset email. Please check your network connection."
            );
            break;
        }
      } else {
        toast.error(
          "Unable to connect. Please check your internet connection."
        );
      }
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async (data) => {
    await forgotPassword(data);
  };
  return (
    <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg backdrop-blur-3xl  border border-neutral-700">
        <h1 className="text-2xl font-bold text-white mb-6">Forgot Password</h1>
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

            <Button
              disabled={isPending}
              className="bg-white mt-2 hover:text-black cursor-pointer hover:bg-white text-black w-full"
              type="submit"
            >
              Send email
            </Button>
            <p className="text-white mt-4">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

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
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const schema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  const { isLoading, isError } = useQuery({
    queryKey: ["verify-reset-password", userId, token],
    queryFn: async () => {
      if (!token || !userId) throw new Error("Missing token or userId");
      const response = await apiClient.get(
        `/auth/reset-password/${userId}/${token}`
      );
      return response.data;
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      if (!token || !userId) throw new Error("Missing token or userId");
      const response = await apiClient.post(
        `/auth/reset-password/${userId}/${token}`,
        { password: data.password }
      );
      return response.data;
    },
    onSuccess: () => {
      toast("Success", { description: "Password reset successfully" });
      navigate("/login");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        const status = error.response?.status;

        switch (status) {
          case 400:
            toast.error(message || "Please check your password format.");
            break;
          case 401:
            toast.error(message || "Invalid or expired reset link.");
            break;
          case 404:
            toast.error(message || "User not found.");
            break;
          case 500:
            toast.error(
              "An unexpected error occurred. Please try again later."
            );
            break;
          default:
            toast.error(
              message || "An unexpected error occurred. Please try again."
            );
        }
      } else {
        console.error(error);
        toast.error(
          "Unable to connect. Please check your internet connection."
        );
      }
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    toast.error("Error verifying token");
    navigate("/login");
    return null;
  }

  const onSubmit: SubmitHandler<ResetPasswordForm> = async (data) => {
    await mutateAsync(data);
  };
  return (
    <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg backdrop-blur-3xl  border border-neutral-700">
        <h1 className="text-2xl font-bold text-white mb-6">Reset Password</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
            <div className="mb-3">
              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="text-white"
                        placeholder="Confirm your password"
                        type="password"
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
              Reset Password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

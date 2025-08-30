import { apiClient } from "@/lib/api";
import type { TodoType } from "@/type";
import {
    useInfiniteQuery,
  type FetchNextPageOptions,
  type InfiniteData,
  type InfiniteQueryObserverResult,
} from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface TodoPage {
    todos: TodoType[];
    hasMore: boolean;
}

type TodoContextType = {
  todos: TodoType[];
  isLoading: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<TodoPage, unknown>, Error>>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => void;
  isRefetching: boolean;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const {user} = useAuth()
    const {
    data: tasks,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["todos"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get(`/todos?page=${pageParam}`);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    enabled: !!user,
  });

interface TodoPage {
    todos: TodoType[];
    hasMore: boolean;
}

interface TasksData {
    pages: TodoPage[];
}

const flatTodos: TodoType[] = (tasks as TasksData)?.pages?.flatMap((page: TodoPage) => page.todos) ?? [];

  return (
    <TodoContext.Provider
      value={{
        todos: flatTodos,
        isLoading: isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage: isFetching,
        refetch,
        isRefetching,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTodo = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error("useTodo must be used within a TodoProvider");
    }
    return context;
};
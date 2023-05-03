import axios from "axios";
import { useQueryClient, useMutation, QueryClientProvider } from "@tanstack/react-query";
import { Task } from "../types";
import useStore from "../store";    
import { useError } from "./useError";    
import { VariableIcon } from "@heroicons/react/24/solid";
    
export const useMutateTask = () => {
    const queryClient = useQueryClient()
    const { switchErrorHandling } = useError()
    const resetEditedTask = useStore((state) => state.resetEditedTask)

    const createTaskMutation = useMutation(
        (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
          axios.post<Task>(`${process.env.REACT_APP_API_URL}/tasks`, task),
        {
          onSuccess: (res) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
              queryClient.setQueryData(['tasks'], [...previousTasks, res.data])
            }
            resetEditedTask()
          },
          onError: (err: any) => {
            if (err.response.data.message) {
              switchErrorHandling(err.response.data.message)
            } else {
              switchErrorHandling(err.response.data)
            }
          },
        }
      )
    const updateTaskMutation = useMutation(
        (task: Omit<Task, 'created_at' | 'updated_at'>) =>
            axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task.id}`, {
                title: task.title,
            }),
        {
          onSuccess: (res, variables) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
                queryClient.setQueryData<Task[]>(
                    ['tasks'],
                    previousTasks.map((task) =>
                        task.id == variables.id ? res.data : task
                    )
                )
            }
            resetEditedTask()
          },
          onError: (err: any) => {
            if (err.response.data.message) {
                switchErrorHandling(err.response.data.message)
            } else {
                switchErrorHandling(err.response.data)
            }
          },
        }
    )
    const deleteTaskMutation = useMutation(
        (id: number) =>
            axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`),
        {
            onSuccess: (_, Variables) => {
                const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
                if (previousTasks) {
                    queryClient.setQueryData<Task[]>(
                        ['tasks'],
                        previousTasks.filter((task) => task.id !== Variables)
                    )
                }
                resetEditedTask()
            },
            onError: (err: any) => {
                if (err.resopnse.data.message) {
                    switchErrorHandling(err.response.data.message)
                } else {
                    switchErrorHandling(err.response.data)
                }
            },
        }
    )
    return {        
        createTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,
    }
}

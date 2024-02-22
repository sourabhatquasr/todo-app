export interface Todo {
    id: number;
    title: string;
    dueDate?: Date | string;
    completed: boolean;
    completedDate?: Date | string;
    description?: string
}
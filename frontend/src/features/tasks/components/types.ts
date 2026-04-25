export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  role: string;
  createdAt: string;
  userName?: string;
}

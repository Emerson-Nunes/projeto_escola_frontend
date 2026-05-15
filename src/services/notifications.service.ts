import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  senderName: string;
  senderUserId: string;
  targetRoles: string;
  createdAt: string;
}

export const notificationsService = {
  async findMine(): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>('/notifications/mine');
    return data;
  },

  async findAll(): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  async create(dto: { title: string; message: string; targetRoles: string[] }): Promise<Notification> {
    const { data } = await api.post<Notification>('/notifications', dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};

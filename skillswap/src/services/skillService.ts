import api from './api';
import type { SkillType } from '@/types';

export const skillService = {
  getSkills: () => api.get('/skills'),
  addSkill: (skillName: string, type: SkillType, level?: string) =>
    api.post('/skills', { skillName, type, level }),
  deleteSkill: (id: number) => api.delete(`/skills/${id}`),
};

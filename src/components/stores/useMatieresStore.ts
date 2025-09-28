import { create } from 'zustand'
import { TraductionDto, TypeMatiereEnum } from '../../services/classe'

type MatiereStore = {
    matieres: Record<TypeMatiereEnum, TraductionDto[]>
    getMatieresByType: (type: TypeMatiereEnum) => TraductionDto[]
    setMatieres: (matieres: Record<TypeMatiereEnum, TraductionDto[]>) => void
}

export const useMatieresStore = create<MatiereStore>((set, get) => ({
    matieres: { ENFANT: [], ADULTE: [] },
    getMatieresByType: (type: TypeMatiereEnum) => get().matieres[type] ?? [],
    setMatieres: (matieres) => set({ matieres })
}))
import { create } from 'zustand'
import { MatiereDto } from '../../services/classe'

type MatiereStore = {
    matieres: MatiereDto[]
    setMatieres: (matieres: MatiereDto[]) => void
}

export const useMatieresStore = create<MatiereStore>((set) => ({
    matieres: [],
    setMatieres: (matieres) => set({ matieres })
}))
import type { WizardData } from '../WizardProgramaPage';

export interface PasoProps {
    datos: WizardData;
    actualizarDatos: (parcial: Partial<WizardData>) => void;
}

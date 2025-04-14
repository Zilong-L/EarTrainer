declare module "@components/EarTrainers/ChordColorTrainer/Constants" {
    interface DegreeInfo {
        name?: string;
        degree?: string;
        distance: number;
        enable?: boolean;
        chordTypes?: string[];
    }

    export const degrees: DegreeInfo[];
    export const defaultDegreeChordTypes: DegreeInfo[];
}
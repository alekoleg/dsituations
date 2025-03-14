export enum KnowledgeLevel {
    A = 'a',
    B = 'b',
    C = 'c'
}

export function parseKnowledgeLevel(value: string | undefined): KnowledgeLevel | null {
    if (!value) {
        return null;
    }

    const normalizedValue = value.toLowerCase().trim();
    
    switch (normalizedValue) {
        case 'a':
            return KnowledgeLevel.A;
        case 'b':
            return KnowledgeLevel.B;
        case 'c':
            return KnowledgeLevel.C;
        default:
            return null;
    }
} 

export function getKnowledgeLevelKey(value: KnowledgeLevel): string {
    switch (value) {
        case KnowledgeLevel.A:
            return "dialog_a1";
        case KnowledgeLevel.B:
            return "dialog_b1";
        case KnowledgeLevel.C:
            return "dialog_c1";
    }
} 

export function getTasksLevelKeyByVersion(value: KnowledgeLevel): string {
    switch (value) {
        case KnowledgeLevel.A:
            return "tasks_a1";
        case KnowledgeLevel.B:
            return "tasks_b1";
        case KnowledgeLevel.C:
            return "tasks_c1";
    }
}
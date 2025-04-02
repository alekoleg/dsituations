## Data Base Models and relations

Speaker 
- id: String
- name: String
- image_link: String
- comment: String
- sex: String

Speech
- id: String
- speaker: Pointer<Speaker>
- text: String
- order: Number
- audio_version: String

Dialog:
- id: String
- subtitle: String
- title: String
- image_link: String
- dialog_a1: Relation<Speech>
- dialog_b1: Relation<Speech>
- dialog_c1: Relation<Speech>
- situation: Pointer<Situation>
- hidden: Boolean
- is_premium: Boolean
- emoji: String
- task_a1: Relations<InteractiveTask>
- task_b1: Relations<InteractiveTask>
- task_c1: Relations<InteractiveTask>

InteractiveTask:
- id: String
- dialog: Pointer<Dialog>
- level: String
- order: Number
- data: String
- type: String

Situation:
- id: String
- title: String
- description: String
- image_link: String



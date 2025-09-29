type Lesson = {
    image: string;
    name: string;
    read: boolean;
    topic: string;
};

type Quiz = {
    _id: string;
    grade: string;
    image: string;
    status: string;
    studentQuizData: {
        marks: number;
        score: number;
        result: 'pass' | 'fail';
        status: string;
        student: string;
        _id: string;
    }[];
};

export type ChildResultType = {
    _id: string;
    difficulty: string;
    image: string;
    lessons: Lesson[];
    name: string;
    quizes: Quiz[];
    subject: string;
    type: string;
    read: number;

};

import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { GoCheckCircle, GoCheckCircleFill } from "react-icons/go";

const TasksComponent = () => {
    const [tasks, setTasks] = useState([
        {
            text: 'Bring groceries',
            isCompleted: false
        },
        {
            text: 'Finish homework',
            isCompleted: true
        },
        {
            text: 'Clean the house',
            isCompleted: false
        },
    ]);

    const [newTask, setNewTask] = useState("");

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([{ text: newTask, isCompleted: false }, ...tasks]);
            setNewTask("");
        }
    };

    const toggleTaskCompletion = (index: number) => {
        const updatedTasks = tasks.map((task, i) =>
            i === index ? { ...task, isCompleted: !task.isCompleted } : task
        );
        setTasks(updatedTasks);
    };

    return (
        <div className="w-full h-full bg-mainBg overflow-y-auto">
            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Tasks</h1>

            <div className="grid grid-cols-12 gap-5 w-full h-8 mb-4 md:mb-8">
                <div className="col-span-10 flex items-center justify-start bg-white px-2 rounded-lg">
                    <IoSearch className="text-2xl mr-3 text-greyBlack" />
                    <input
                        className="outline-none py-2 md:py-4 w-full placeholder:text-greyBlack text-md font-ubuntu font-medium"
                        placeholder="Search tasks here..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                </div>

                <div
                    className="col-span-2 h-full bg-red-500 rounded-lg flex items-center justify-center cursor-pointer hover:animate-pulse"
                    onClick={addTask}
                >
                    <IoMdAdd className="text-2xl text-mainBg" />
                </div>
            </div>

            <div className="w-full bg-white py-4 px-3 md:px-4 overflow-y-auto max-h-56 sm:max-h-64">
                {tasks.map((item, index) => (
                    <div key={index} className="flex items-center justify-start border-b last:border-b-0 border-grey pb-3 pt-3 last:pb-0">
                        <div className="flex items-start justify-start mr-2 active:animate-ping" onClick={() => toggleTaskCompletion(index)}>
                            {item.isCompleted ? <GoCheckCircleFill className="text-lg lg:text-xl text-red-500" /> : <GoCheckCircle className="text-lg lg:text-xl text-red-500" />}
                        </div>
                        <div className="flex items-center justify-start" >
                            <p className={`text-xs md:text-sm xl:text-base ${item.isCompleted ? 'line-through' : ''}`}>{item.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksComponent;
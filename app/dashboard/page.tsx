"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface Task {
    id: string;
    title: string;
    detail: string;
    deadline: Date | null;
    completed: boolean;
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Add modal form states
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [deadline, setDeadline] = useState("");

    const router = useRouter();

    // Logout
    const handleLogout = async () => {
        await signOut(auth);
        await fetch("/api/logout", { method: "POST" });
        router.push("/");
    };


    // Listen to realtime tasks
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userTasks: Task[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                userTasks.push({
                    id: docSnap.id,
                    title: data.title,
                    detail: data.detail,
                    deadline: data.deadline ? data.deadline.toDate() : null,
                    completed: data.completed,
                });
            });
            setTasks(userTasks);
        });
        return () => unsubscribe();
    }, [user]);

    // Add quick task
    const handleAddTask = async () => {
        if (!user || !newTask.trim()) return;
        await addDoc(collection(db, "tasks"), {
            title: newTask,
            detail: "",
            deadline: Timestamp.fromDate(new Date()),
            completed: false,
            userId: user.uid,
        });
        setNewTask("");
    };

    // Add detailed task (from modal)
    const handleAddDetailTask = async () => {
        if (!user || !title.trim()) return;
        await addDoc(collection(db, "tasks"), {
            title,
            detail,
            deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
            completed: false,
            userId: user.uid,
        });
        setTitle("");
        setDetail("");
        setDeadline("");
        setShowAddModal(false);
    };

    // Save edited task
    const handleSaveEditTask = async () => {
        if (!editingTask) return;
        await updateDoc(doc(db, "tasks", editingTask.id), {
            title: editingTask.title,
            detail: editingTask.detail,
            deadline: editingTask.deadline
                ? Timestamp.fromDate(editingTask.deadline)
                : null,
        });
        setShowEditModal(false);
        setEditingTask(null);
    };

    // Toggle completion
    const toggleComplete = async (taskId: string, completed: boolean) => {
        await updateDoc(doc(db, "tasks", taskId), { completed: !completed });
    };

    // Delete task
    const handleDelete = async (taskId: string) => {
        await deleteDoc(doc(db, "tasks", taskId));
    };

    if (loading) return <p className="text-white">Loading...</p>;
    if (!user) return <p className="text-white">Not logged in</p>;

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button variant="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            {/* Add task form */}
            <div className="flex gap-2 mb-6">
                <Input
                    type="text"
                    placeholder="New task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <Button onClick={handleAddTask}>Add</Button>
                <Button variant="secondary" onClick={() => setShowAddModal(true)}>
                    Add Details
                </Button>
            </div>

            {/* Task list */}
            <ul className="space-y-3">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        className="flex items-center justify-between bg-gray-900 p-3 rounded-lg"
                    >
                        <div>
                            <p className={task.completed ? "line-through" : ""}>
                                {task.title}
                            </p>
                            <small className="text-gray-400">
                                Deadline:{" "}
                                {task.deadline
                                    ? task.deadline.toLocaleString("en-US", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    })
                                    : "No deadline"}
                            </small>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className={task.completed
                                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"}
                                variant="secondary"
                                onClick={() => toggleComplete(task.id, task.completed)}
                            >
                                {task.completed ? "Undo" : "Complete"}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setEditingTask(task);
                                    setShowEditModal(true);
                                }}
                            >
                                Edit
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" variant="secondary" onClick={() => handleDelete(task.id)}>
                                Remove
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                        placeholder="Details"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                    />
                    <Input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddDetailTask}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    {editingTask && (
                        <>
                            <Input
                                value={editingTask.title}
                                onChange={(e) =>
                                    setEditingTask({ ...editingTask, title: e.target.value })
                                }
                            />
                            <Textarea
                                value={editingTask.detail}
                                onChange={(e) =>
                                    setEditingTask({ ...editingTask, detail: e.target.value })
                                }
                            />
                            <Input
                                type="datetime-local"
                                value={
                                    editingTask.deadline
                                        ? editingTask.deadline.toISOString().slice(0, 16)
                                        : ""
                                }
                                onChange={(e) =>
                                    setEditingTask({
                                        ...editingTask,
                                        deadline: e.target.value ? new Date(e.target.value) : null,
                                    })
                                }
                            />
                        </>
                    )}
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEditTask}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

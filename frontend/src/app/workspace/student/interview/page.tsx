"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/student-ai/layout/ProtectedRoute";
import AppLayout from "@/app/components/student-ai/layout/AppLayout";
import { firestore as db, auth } from "@/app/lib/student-ai/firebase";
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from "firebase/firestore";
import { callRunInterview, GenerateQuestionResult, EvaluateAnswerResult } from "@/app/lib/student-ai/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Textarea } from "@/app/components/ui/Textarea";
import { Loader2, MessageSquare, Brain, Play, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Clock, BarChart } from "lucide-react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const TOPICS = [
    { value: "math", label: "Mathematics" },
    { value: "science", label: "General Science" },
    { value: "languages", label: "Literature / Languages" },
    { value: "social", label: "Social Studies" },
    { value: "cs", label: "Computer Science" },
    { value: "aptitude", label: "Logical Aptitude" }
];

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface SubmissionRecord {
    id: string;
    topic: string;
    overallScore: number;
    createdAt: Date;
}

type Mode = "idle" | "question" | "evaluated";

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function InterviewPage() {
    return (
        <ProtectedRoute>
            <AppLayout>
                <InterviewSimulator />
            </AppLayout>
        </ProtectedRoute>
    );
}

function InterviewSimulator() {
    const [topic, setTopic] = useState("math");
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [evaluationResult, setEvaluationResult] = useState<EvaluateAnswerResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<Mode>("idle");
    const [recentSubmissions, setRecentSubmissions] = useState<SubmissionRecord[]>([]);

    // ─── FETCH HISTORY ──────────────────────────────────────────────────────
    const fetchHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const q = query(
                collection(db, "submissions"),
                where("userId", "==", user.uid),
                where("type", "==", "interview"),
                orderBy("createdAt", "desc"),
                limit(5)
            );
            const snapshot = await getDocs(q);
            const history = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    topic: data.topic,
                    overallScore: data.overallScore,
                    createdAt: data.createdAt?.toDate() || new Date()
                };
            });
            setRecentSubmissions(history);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // ─── ACTIONS ────────────────────────────────────────────────────────────

    const handleGenerateQuestion = async () => {
        setLoading(true);
        const { data, error } = await callRunInterview({ mode: "generate", topic });

        if (error || !data || !("question" in data)) {
            console.error("Generate error:", error);
            setLoading(false);
            return;
        }

        setCurrentQuestion(data.question);
        setMode("question");
        setUserAnswer("");
        setEvaluationResult(null);
        setLoading(false);
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion || !userAnswer.trim()) return;

        setLoading(true);
        const { data, error } = await callRunInterview({
            mode: "evaluate",
            topic,
            question: currentQuestion,
            answer: userAnswer
        });

        if (error || !data || !("rubric" in data)) {
            console.error("Evaluate error:", error);
            setLoading(false);
            return;
        }

        setEvaluationResult(data as EvaluateAnswerResult);
        setMode("evaluated");
        setLoading(false);
        // Refresh history to include the new submission
        fetchHistory();
    };

    const handleNextQuestion = () => {
        setCurrentQuestion(null);
        setUserAnswer("");
        setEvaluationResult(null);
        setMode("idle");
    };

    // ─── RENDER ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-sl-text flex items-center gap-2.5 tracking-tight">
                    <MessageSquare size={22} className="text-sl-primary shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
                    Interview Simulator
                </h1>
                <p className="text-sm text-black/60 mt-0.5">Practice VLSI mock interviews with AI evaluation</p>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* ── LEFT COMPONENT: SIMULATOR ── */}
                <div className="col-span-8 space-y-6">
                    <Card className="rounded-3xl border border-black/10 shadow-2xl bg-white backdrop-blur-2xl relative overflow-hidden">
                        <CardHeader className="pb-4 pt-5 px-6 border-b border-black/10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold text-black/70 uppercase tracking-widest">
                                    Mock Interview Session
                                </CardTitle>
                                {mode === "idle" && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-medium text-black/60">Topic:</label>
                                        <select
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            disabled={loading}
                                            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium text-sl-text bg-white/5 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                                        >
                                            {TOPICS.map(t => (
                                                <option key={t.value} value={t.value} className="bg-sl-light text-sl-text">{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {/* IDLE MODE */}
                            {mode === "idle" && (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-sl-primary/10 border border-orange-500/20 flex items-center justify-center mb-6">
                                        <Brain size={32} className="text-orange-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-sl-text mb-2">Ready for your interview?</h3>
                                    <p className="text-sm text-black/60 max-w-sm mb-8 leading-relaxed">
                                        Select a topic from the dropdown above and generate a realistic VLSI technical interview question.
                                    </p>
                                    <Button
                                        onClick={handleGenerateQuestion}
                                        disabled={loading}
                                        className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-sl-text font-medium border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
                                    >
                                        {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Processing...</> : "Generate Interview Question"}
                                    </Button>
                                </div>
                            )}

                            {/* QUESTION MODE */}
                            {(mode === "question" || mode === "evaluated") && currentQuestion && (
                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-black/10 shadow-inner">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest">Question</h4>
                                        </div>
                                        <p className="text-base text-black/80 leading-relaxed font-medium">
                                            {currentQuestion}
                                        </p>
                                    </div>

                                    {mode === "question" && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-black/60 uppercase tracking-widest ml-1">Your Answer</label>
                                            <Textarea
                                                value={userAnswer}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserAnswer(e.target.value)}
                                                placeholder="Type your comprehensive technical answer here..."
                                                disabled={loading}
                                                className="min-h-[200px] resize-y bg-[var(--sl-paper)]/40 border-black/10 text-black/80 placeholder:text-black/40 rounded-2xl p-4 text-sm focus-visible:ring-1 focus-visible:ring-orange-500 custom-scrollbar"
                                            />
                                            <div className="pt-2 flex justify-end">
                                                <Button
                                                    onClick={handleSubmitAnswer}
                                                    disabled={!userAnswer.trim() || loading}
                                                    className="h-11 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium transition-all"
                                                >
                                                    {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Evaluating...</> : "Submit Answer"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {mode === "evaluated" && evaluationResult && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-black/10">
                                                <label className="text-xs font-bold text-black/60 uppercase tracking-widest">Your Submitted Answer</label>
                                            </div>
                                            <div className="p-4 rounded-xl bg-[var(--sl-paper)]/30 text-sm text-black/60 leading-relaxed whitespace-pre-wrap border border-black/10">
                                                {userAnswer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── EVALUATION RESULTS ── */}
                    {mode === "evaluated" && evaluationResult && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                            <Card
                                className="rounded-3xl border shadow-2xl backdrop-blur-2xl relative overflow-hidden"
                                style={{
                                    background: "radial-gradient(120% 100% at 50% 0%, rgba(249,115,22,0.1) 0%, rgba(9,9,11,0.95) 100%)",
                                    borderColor: "rgba(249,115,22,0.2)"
                                }}
                            >
                                <CardHeader className="pb-2 pt-6 px-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                            <BarChart size={16} /> Evaluation Report
                                        </CardTitle>
                                        <div className="flex items-baseline gap-1 bg-[var(--sl-paper)]/40 px-3 py-1.5 rounded-xl border border-black/10">
                                            <span className="text-3xl font-bold text-sl-text">{evaluationResult.overallScore}</span>
                                            <span className="text-xs text-black/50 font-medium">/100</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">

                                    {/* Score Bars */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <ScoreBar label="Technical Depth" score={Number((evaluationResult.rubric as any).technicalDepth || 0)} />
                                        <ScoreBar label="Clarity" score={Number((evaluationResult.rubric as any).clarity || 0)} />
                                        <ScoreBar label="Correctness" score={Number((evaluationResult.rubric as any).correctness || 0)} />
                                    </div>

                                    {/* Feedback */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-black/60 uppercase tracking-widest">Detailed Feedback</h4>
                                        <p className="text-sm text-black/70 leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-black/10">
                                            {(evaluationResult.rubric as any).feedback}
                                        </p>
                                    </div>

                                    {/* Improvements */}
                                    {((evaluationResult.rubric as any).improvementAreas || []).length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle size={14} /> Areas to Improve
                                            </h4>
                                            <ul className="space-y-2">
                                                {((evaluationResult.rubric as any).improvementAreas as string[]).map((area, idx) => (
                                                    <li key={idx} className="flex gap-3 text-sm text-black/70 p-3 rounded-xl bg-red-950/20 border border-red-900/30">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                                        <span className="leading-relaxed">{area}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-black/10 flex justify-end">
                                        <Button
                                            onClick={handleNextQuestion}
                                            className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-sl-text font-medium border border-black/10 transition-all gap-2"
                                        >
                                            Next Question <ArrowRight size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COMPONENT: HISTORY ── */}
                <div className="col-span-4 space-y-6">
                    <Card className="rounded-3xl border border-black/10 shadow-2xl bg-white backdrop-blur-2xl">
                        <CardHeader className="pb-4 pt-5 px-6 border-b border-black/10">
                            <CardTitle className="text-sm font-bold text-black/70 uppercase tracking-widest">
                                Recent Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {recentSubmissions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock size={24} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-xs text-black/50">No recent interview submissions</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentSubmissions.map(sub => (
                                        <div key={sub.id} className="p-3 rounded-xl bg-white/[0.02] border border-black/10 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-default">
                                            <div>
                                                <p className="text-sm font-medium text-black/80">
                                                    {TOPICS.find(t => t.value === sub.topic)?.label || sub.topic}
                                                </p>
                                                <p className="text-[10px] text-black/50 mt-0.5">
                                                    {sub.createdAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--sl-paper)]/40 border border-black/10">
                                                <CheckCircle2 size={12} className={sub.overallScore >= 70 ? "text-emerald-500" : "text-amber-500"} />
                                                <span className="text-xs font-bold text-sl-text">{sub.overallScore}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string, score: number }) {
    // Coloring logic
    let colorClass = "from-emerald-500 to-emerald-400";
    if (score < 40) colorClass = "from-red-500 to-rose-400";
    else if (score < 70) colorClass = "from-amber-500 to-orange-400";

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-black/60">{label}</span>
                <span className="text-sl-text bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{score}/100</span>
            </div>
            <div className="h-1.5 bg-[var(--sl-paper)]/60 rounded-full overflow-hidden border border-black/10">
                <div
                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                />
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { Navbar, SideDrawer } from "../../../components";
import { TextField, FormControl, InputLabel, Select, MenuItem, Radio, FormControlLabel, Button, Chip, List, ListItem, ListItemText, Stack, IconButton, Tooltip, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import { Get, Post, Put } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { Quiz } from "../../../components/hrAdminComponents/Quiz";

const UpdateQuiz = () => {
  const location = useLocation();


  const [questionName, setQuestionName] = useState<string>("");
  const [optionA, setOptionA] = useState<string>("");
  const [optionB, setOptionB] = useState<string>("");
  const [optionC, setOptionC] = useState<string>("");
  const [optionD, setOptionD] = useState<string>("");
  const [subjectdata, setSubjectData] = useState<any[]>([]);
  const [topicdata, setTopicData] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lesson, setLesson] = useState<string | number | null>(location?.state?.lesson?._id ?? null)
  const [topic, setTopic] = useState<string | number | null>(location?.state?.topic?._id ?? null);
  const [subject, setSubject] = useState<string | number | null>(location?.state?.subject?._id ?? null);
  const [subjectError, setSubjectError] = useState<string>("");
  const [topicError, setTopicError] = useState<string>("");
  const [lessonError, setLessonError] = useState<string>("");
  const [quizType, setQuizType] = useState<string | number | null>(location?.state?.type);

  const [correctQuestion, setCorrectQuestion] = useState<
    string | number | null
  >(null);

  const [score, setScore] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>(
    location?.state?.questions
      .map((i: any) => {
        return {
          questionName: i.question,
          options: { A: i.options[0], B: i.options[1], C: i.options[2], D: i.options[3] },
          correctQuestion: i.options?.indexOf(i?.answer) + 1,

          score: i.score,

        }
      })
    ?? []);

  const [totalScore, setTotalScore] = useState<number>(
    location?.state?.questions?.reduce((sum: number, q: any) => sum + (q.score || 0), 0) || 0
  );

  // Quiz start and end times (time only)
  const [startTime, setStartTime] = useState<string>(() => {
    if (location?.state?.startsAt) {
      const date = new Date(location.state.startsAt);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 5); // Extract HH:MM format
      }
    }
    return "";
  });
  const [endTime, setEndTime] = useState<string>(() => {
    if (location?.state?.endsAt) {
      const date = new Date(location.state.endsAt);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 5); // Extract HH:MM format
      }
    }
    return "";
  });
  const navigate = useNavigate();


  // Separate Errors
  const [questionError, setQuestionError] = useState<string>("");
  const [optionAError, setOptionAError] = useState<string>("");
  const [optionBError, setOptionBError] = useState<string>("");
  const [optionCError, setOptionCError] = useState<string>("");
  const [optionDError, setOptionDError] = useState<string>("");
  const [correctQuestionError, setCorrectQuestionError] = useState<string>("");
  const [scoreError, setScoreError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");
  const [isEdit, setIsEdit] = useState(!!location?.state?._id)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)
  const [currentEditingQuizId, setCurrentEditingQuizId] = useState<string | null>(location?.state?._id || null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter out the currently editing quiz
  const filteredQuizzes = quizzes.filter((q: any) => {
    if (currentEditingQuizId && q._id === currentEditingQuizId) {
      return false;
    }
    return true;
  });

  const correctQuestionData = [
    { label: "Option A", value: 1 },
    { label: "Option B", value: 2 },
    { label: "Option C", value: 3 },
    { label: "Option D", value: 4 },
  ];

  const handleAddQuestion = () => {
    // Reset errors
    setQuestionError("");
    setOptionAError("");
    setOptionBError("");
    setOptionCError("");
    setOptionDError("");
    setCorrectQuestionError("");
    setScoreError("");

    if (!subject) {
      setSubjectError("Please select Subject");
    }
    if (!topic) {
      setTopicError("Please select Topic");
    }
    if (!lesson) {
      setLessonError("Please select Lesson");
    }
    // Validation: Ensure all fields are filled
    if (!questionName) {
      setQuestionError("Please fill out the question.");
      return;
    }
    if (!optionA) {
      setOptionAError("Please fill out option A.");
      return;
    }
    if (!optionB) {
      setOptionBError("Please fill out option B.");
      return;
    }
    if (!optionC) {
      setOptionCError("Please fill out option C.");
      return;
    }
    if (!optionD) {
      setOptionDError("Please fill out option D.");
      return;
    }
    if (!correctQuestion) {
      setCorrectQuestionError("Please select the correct answer.");
      return;
    }
    if (!score) {
      setScoreError("Please enter the question score.");
      return;
    }

    // Create question payload
    const newQuestion = {
      questionName,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      correctQuestion,
      score: parseInt(score, 10),
    };

    if (editingQuestionIndex !== null && editingQuestionIndex > -1) {
      // Update existing question
      const updated = [...questions];
      const prevScore = Number(updated[editingQuestionIndex]?.score) || 0;
      updated[editingQuestionIndex] = newQuestion;
      setQuestions(updated);
      setTotalScore(totalScore - prevScore + newQuestion.score);
    } else {
      // Add the new question to the list
      setQuestions([...questions, newQuestion]);
      setTotalScore(totalScore + newQuestion.score); // Update total score
    }

    // Reset fields
    setQuestionName("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectQuestion(null);
    setScore("");
    setEditingQuestionIndex(null);

    // Close modal
    setShowQuestionModal(false);
  };

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setQuestionName(question.questionName);
    setOptionA(question.options.A);
    setOptionB(question.options.B);
    setOptionC(question.options.C);
    setOptionD(question.options.D);
    setCorrectQuestion(question.correctQuestion);
    setScore(question.score.toString());
    setEditingQuestionIndex(index);
    setShowQuestionModal(true);
  };

  const handleUpdateQuestion = () => {
    // Reset errors
    setQuestionError("");
    setOptionAError("");
    setOptionBError("");
    setOptionCError("");
    setOptionDError("");
    setCorrectQuestionError("");
    setScoreError("");

    // Validation: Ensure all fields are filled
    if (!questionName) {
      setQuestionError("Please fill out the question.");
      return;
    }
    if (!optionA) {
      setOptionAError("Please fill out option A.");
      return;
    }
    if (!optionB) {
      setOptionBError("Please fill out option B.");
      return;
    }
    if (!optionC) {
      setOptionCError("Please fill out option C.");
      return;
    }
    if (!optionD) {
      setOptionDError("Please fill out option D.");
      return;
    }
    if (!correctQuestion) {
      setCorrectQuestionError("Please select the correct answer.");
      return;
    }
    if (!score) {
      setScoreError("Please enter the question score.");
      return;
    }

    // Update the question in the list
    const updatedQuestion = {
      questionName,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      correctQuestion,
      score: parseInt(score, 10),
    };

    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestionIndex!] = updatedQuestion;
    setQuestions(updatedQuestions);

    // Recalculate total score
    const newTotalScore = updatedQuestions.reduce((sum, q) => sum + q.score, 0);
    setTotalScore(newTotalScore);

    // Reset fields and editing state
    setQuestionName("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectQuestion(null);
    setScore("");
    setEditingQuestionIndex(null);
  };

  const handleDeleteQuestion = (index: number) => {
    setPendingDeleteIndex(index);
    setConfirmDeleteOpen(true);
  };

  const handleCancelEdit = () => {
    setQuestionName("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectQuestion(null);
    setScore("");
    setEditingQuestionIndex(null);
    setShowQuestionModal(false);
  };


  useEffect(() => {
    Get("/subject").then((d) => {
      if (d.success) {
        setSubjectData(d.data);
      } else {
        displayMessage(d.message, "error");
      }
    });
  }, []);

  useEffect(() => {
    // Fetch existing quizzes for quick load
    setLoadingQuizzes(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const endpoint = user?.userType === "HR-Admin" ? "/quiz" : `/quiz?createdBy=${user?.profile?._id}`;
      Get(endpoint).then((d) => {
        if (d?.success) {
          setQuizzes(Array.isArray(d.data) ? d.data : []);
        } else {
          setQuizzes([]);
        }
      }).finally(() => setLoadingQuizzes(false));
    } catch {
      setLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    if (subject != null) {
      Get(`/topic/simple/subject/${subject}`).then((d) => {
        if (d.success) {
          setTopicData(d.data);
        } else {
          setTopicData([]);
          displayMessage(d.message);
        }
      }).catch(() => {
        setTopicData([]);
      });
    } else {
      setTopicData([]);
    }
  }, [subject]);

  useEffect(() => {
    if (topic != null) {
      Get(`/topic/lesson/simple/${topic}`).then((d) => {
        if (d.success) {
          setLessons(d.data);
        } else {
          setLessons([]);
          displayMessage(d.message);
        }
      }).catch(() => {
        setLessons([]);
      });
    } else {
      setLessons([]);
    }
  }, [topic]);

  const handleTimeValidation = () => {
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        setTimeError("End time must be later than start time.");
        return false;
      }
    }
    setTimeError("");
    return true;
  };

  const handleUploadQuiz = () => {
    if (submitting) return;
    // Convert time strings to Date objects for today
    const today = new Date();
    const startDateTime = startTime ? new Date(`${today.toDateString()} ${startTime}`) : null;
    const endDateTime = endTime ? new Date(`${today.toDateString()} ${endTime}`) : null;

    // Basic validation
    if (!subject || !topic || !lesson) {
      displayMessage("Please select subject, topic and lesson.", "error");
      return;
    }
    if (questions.length === 0) {
      displayMessage("Please add at least one question.", "error");
      return;
    }

    setSubmitting(true)

    const normalizedType = typeof quizType === 'string' ? quizType.toLowerCase() : 'universal';
    const payload = {
      subject,
      topic,
      lesson,
      type: normalizedType,
      score: totalScore,
      startsAt: startDateTime,
      endsAt: endDateTime,
      questions: questions.map((i) => {
        let option = Object.values(i.options);
        return {
          question: i.questionName,
          options: option,
          answer: option[(Number(i.correctQuestion) || 1) - 1],
          score: i.score,
        };
      }),
    };

    if (!isEdit) {
      Post("/quiz/teacher", payload)
        .then((d) => {
          if (d.success) {
            displayMessage(d.message, "success")
            navigate(RouteName.MY_QUIZZES)
          } else {
            displayMessage(d.message, "error")
          }
        })
        .catch((e) => {
          displayMessage(e.message, "error")
        })
        .finally(() => setSubmitting(false));
    } else {
      Put(`/quiz/teacher/${location.state?._id}`, payload)
        .then((d) => {
          if (d.success) {
            displayMessage(d.message, "success")
            navigate(RouteName.MY_QUIZZES)
          } else {
            displayMessage(d.message, "error")
          }
        })
        .catch((e) => {
          displayMessage(e.message, "error")
        })
        .finally(() => setSubmitting(false));
    }
  };

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
        {/* 1st Navbar */}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title={isEdit ? "Edit Quiz" : "Add Quiz"} hideSearchBar />
        </div>

        {/* center */}
        <div className="w-full flex flex-col gap-4 px-5 mb-6 bg-mainBg h-fit pb-12">
          {/* Quiz Meta (minimal) */}
          <div className="bg-white border border-gray-200 rounded-md p-4 w-full">
            <h3 className="text-sm font-medium text-greyBlack mb-3">Quiz timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextField
                type="time"
                label="Start time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="time"
                label="End time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <div className="flex items-end">
                <div className="text-sm text-greyBlack">Total score: <span className="font-medium">{totalScore}</span></div>
              </div>
            </div>
            {timeError && <p className="text-red-500 text-sm mt-2">{timeError}</p>}
          </div>

          {/* Quiz Selection (minimal) */}
          <div className="bg-white border border-gray-200 rounded-md p-4 w-full">
            <h3 className="text-sm font-medium text-greyBlack mb-3">Quiz details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormControl size="small">
                <InputLabel>Subject</InputLabel>
                <Select label="Subject" value={subject ?? ''} onChange={(e) => {
                  setSubject(e.target.value);
                  setTopic(null); // Reset topic when subject changes
                  setLesson(null); // Reset lesson when subject changes
                }}>
                  {subjectdata.length > 0 ? (
                    subjectdata.map((i) => (
                      <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No subjects available</MenuItem>
                  )}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Topic</InputLabel>
                <Select label="Topic" value={topic ?? ''} onChange={(e) => {
                  setTopic(e.target.value);
                  setLesson(null); // Reset lesson when topic changes
                }}>
                  {topicdata.length > 0 ? (
                    topicdata.map((i) => (
                      <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No topics available</MenuItem>
                  )}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Lesson</InputLabel>
                <Select label="Lesson" value={lesson ?? ''} onChange={(e) => setLesson(e.target.value)}>
                  {lessons.length > 0 ? (
                    lessons.map((i) => (
                      <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No lessons available</MenuItem>
                  )}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Visibility</InputLabel>
                <Select label="Visibility" value={quizType ?? ''} onChange={(e) => setQuizType(e.target.value)}>
                  <MenuItem value={'private'}>Private</MenuItem>
                  <MenuItem value={'universal'}>Universal</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Questions (Material redesign) */}
          <div className="bg-white border border-gray-200 rounded-md p-4 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-greyBlack">Questions</h3>
                {currentEditingQuizId && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    Editing Quiz
                  </span>
                )}
              </div>
              <Button
                variant="contained"
                size="small"
                onClick={() => { setEditingQuestionIndex(null); setShowQuestionModal(true); }}
                disabled={questions?.length >= 100}
                sx={{ textTransform: 'none' }}
              >
                {questions?.length >= 100 ? 'Max 100 reached' : `Add Question ${questions?.length + 1}`}
              </Button>
            </div>
            {questions.length === 0 ? (
              <div className="text-sm text-grey">No questions added yet.</div>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                {questions.map((q, index) => (
                  <>
                    <ListItem
                      key={`q-${index}`}
                      alignItems="flex-start"
                      secondaryAction={
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Tooltip title="Edit question">
                            <IconButton edge="end" aria-label="edit" onClick={() => handleEditQuestion(index)} sx={{ bgcolor: 'warning.main', color: 'common.white', borderRadius: '50%', '&:hover': { bgcolor: 'warning.dark' } }}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove question">
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(index)} sx={{ bgcolor: 'error.main', color: 'common.white', borderRadius: '50%', '&:hover': { bgcolor: 'error.dark' } }}>
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                      sx={{ py: 1.5, pr: 12 }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <span className="text-sm font-medium text-greyBlack truncate">Q{index + 1}. {q.questionName}</span>
                            <Stack direction="row" spacing={1}>
                              <Chip size="small" label={`Score: ${q.score}`} />
                              <Chip size="small" color="primary" label={`Correct: ${['A', 'B', 'C', 'D'][Math.max(1, Number(q.correctQuestion)) - 1] || 'A'}`} />
                            </Stack>
                          </Stack>
                        }
                        secondary={
                          <div className="mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Chip variant="outlined" size="small" label={`A: ${q.options.A}`} />
                              <Chip variant="outlined" size="small" label={`B: ${q.options.B}`} />
                              <Chip variant="outlined" size="small" label={`C: ${q.options.C}`} />
                              <Chip variant="outlined" size="small" label={`D: ${q.options.D}`} />
                            </div>
                          </div>
                        }
                        sx={{ mr: 2 }}
                      />
                    </ListItem>
                    {index < questions.length - 1 && <Divider component="li" />}
                  </>
                ))}
              </List>
            )}
          </div>

          {/* Existing Quizzes (Modern Card Design) */}
          <div className="bg-white border border-gray-200 rounded-md p-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-greyBlack">Existing quizzes</h3>
              {loadingQuizzes ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-grey">Loading...</span>
                </div>
              ) : null}
            </div>
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">No quizzes available</h4>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  You haven't created any quizzes yet. Start building your quiz collection by adding questions above.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Use the "Add Question" button to create your first quiz</span>
                </div>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-50 to-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">Quiz being edited</h4>
                <p className="text-sm text-gray-600">
                  The quiz you're currently editing is hidden from this list.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((q: any, idx: number) => (
                  <div key={q?._id || idx} className="group bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Card Header with Gradient */}
                    <div
                      className="relative h-16"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-sm">
                          {(q?.subject?.name || "Q").slice(0, 1).toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${q?.type === 'private'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                          }`}>
                          {q?.type === 'private' ? 'Private' : 'Universal'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                          {q?.subject?.name || "Untitled Subject"}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {q?.topic?.name || "No Topic"} • {q?.lesson?.name || "No Lesson"}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-sm font-bold text-blue-600">{q?.questions?.length || 0}</div>
                            <div className="text-xs text-blue-600">Questions</div>
                          </div>
                          <div className="text-center p-2 bg-emerald-50 rounded-lg">
                            <div className="text-sm font-bold text-emerald-600">{q?.score ?? 0}</div>
                            <div className="text-xs text-emerald-600">Total Score</div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 mb-3">
                          Created: {q?.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>

                      {/* Load Button */}
                      <button
                        className="w-full text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                        style={{
                          background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #5b5cf6 0%, #4338ca 100%)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)';
                        }}
                        onClick={() => {
                          setIsEdit(true);
                          setCurrentEditingQuizId(q._id);
                          setSubject(q?.subject?._id || null);
                          setTopic(q?.topic?._id || null);
                          setLesson(q?.lesson?._id || null);
                          setQuizType((q?.type || 'private').toLowerCase());
                          // Map questions from API shape to editor shape
                          const mapped = (q?.questions || []).map((it: any) => ({
                            questionName: it?.question || "",
                            options: {
                              A: Array.isArray(it?.options) ? (it.options[0] || "") : "",
                              B: Array.isArray(it?.options) ? (it.options[1] || "") : "",
                              C: Array.isArray(it?.options) ? (it.options[2] || "") : "",
                              D: Array.isArray(it?.options) ? (it.options[3] || "") : "",
                            },
                            // We cannot know original index safely; derive from answer text if present
                            correctQuestion: Array.isArray(it?.options) && it?.answer
                              ? Math.max(1, (it.options || []).findIndex((opt: string) => (opt || '').toLowerCase() === (it.answer || '').toLowerCase()) + 1)
                              : 1,
                            score: Number(it?.score) || 0,
                          }));
                          setQuestions(mapped);
                          setTotalScore(mapped.reduce((s: number, it: any) => s + (Number(it.score) || 0), 0));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          displayMessage("Loaded quiz into editor", "success");
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Load to Editor</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Quiz Button - Fixed at bottom */}
          <div className="sticky bottom-0 bg-mainBg pt-4 border-t border-gray-200">
            <div className="flex gap-3 items-center justify-between w-full">
              {questions.length > 0 ? (
                <div className="text-sm text-grey">
                  {`${questions.length} question${questions.length === 1 ? '' : 's'} • Total score: ${totalScore}`}
                </div>
              ) : <div />}
              <button
                className={`py-3 px-8 bg-primary text-white rounded-lg hover:opacity-80 transition-all delay-100 font-medium ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (handleTimeValidation()) {
                    handleUploadQuiz();
                  }
                }}
                disabled={questions?.length >= 100 || submitting || questions.length === 0}
              >
                {submitting ? 'Submitting...' : (isEdit ? 'Update Quiz' : 'Upload Quiz')}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-greyBlack">{editingQuestionIndex !== null ? 'Update Question' : `Add Question ${questions?.length + 1}`}</h3>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleAddQuestion(); } }}>
                <TextField
                  label="Question"
                  placeholder="Type your question..."
                  multiline
                  minRows={4}
                  value={questionName}
                  onChange={(e) => setQuestionName(e.target.value)}
                  error={Boolean(questionError)}
                  helperText={questionError || ''}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />

                <div className="flex flex-col gap-3 mb-4">
                  <span className="text-sm text-grey">Options</span>
                  {[
                    { label: 'A', value: optionA, setter: setOptionA, err: optionAError, idx: 1 },
                    { label: 'B', value: optionB, setter: setOptionB, err: optionBError, idx: 2 },
                    { label: 'C', value: optionC, setter: setOptionC, err: optionCError, idx: 3 },
                    { label: 'D', value: optionD, setter: setOptionD, err: optionDError, idx: 4 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <FormControlLabel
                        control={<Radio checked={correctQuestion === row.idx} onChange={() => setCorrectQuestion(row.idx)} />}
                        label={row.label}
                      />
                      <TextField
                        placeholder={`Option ${row.label}`}
                        value={row.value}
                        onChange={(e) => row.setter(e.target.value)}
                        error={Boolean(row.err)}
                        helperText={row.err || ''}
                        size="small"
                        fullWidth
                      />
                    </div>
                  ))}
                  {correctQuestionError && <span className="text-xs text-red-500">{correctQuestionError}</span>}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <TextField
                    type="number"
                    label="Score"
                    size="small"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    inputProps={{ min: 0, step: 1 }}
                    sx={{ width: 120 }}
                  />
                  <span className="ml-auto text-xs text-grey">Ctrl/⌘ + Enter to add</span>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outlined" onClick={() => setShowQuestionModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                  <Button variant="contained" color={editingQuestionIndex !== null ? 'warning' : 'primary'} onClick={handleAddQuestion} sx={{ textTransform: 'none' }}>{editingQuestionIndex !== null ? 'Update' : 'Add Question'}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => {
        if (!isDeleting) {
          setConfirmDeleteOpen(false);
          setPendingDeleteIndex(null);
        }
      }}>
        <DialogTitle>Delete question?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will remove the selected question from your quiz. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!isDeleting) {
                setConfirmDeleteOpen(false);
                setPendingDeleteIndex(null);
              }
            }}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={isDeleting}
            onClick={() => {
              if (pendingDeleteIndex !== null && !isDeleting) {
                setIsDeleting(true);

                // Simulate a brief delay for better UX (you can remove this if not needed)
                setTimeout(() => {
                  const next = questions.filter((_, i) => i !== pendingDeleteIndex);
                  setQuestions(next);
                  setTotalScore(next.reduce((s, qq) => s + (Number(qq.score) || 0), 0));

                  setConfirmDeleteOpen(false);
                  setPendingDeleteIndex(null);
                  setIsDeleting(false);

                  displayMessage("Question deleted successfully", "success");
                }, 500);
              }
            }}
            sx={{
              textTransform: 'none',
              minWidth: '100px',
              position: 'relative'
            }}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default UpdateQuiz;

// components/projects/screeninng-question-form.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { HelpCircle, ListChecks, Plus, X, Loader2 } from "lucide-react";
import API from "@/services/api";

export default function ScreeningQuestionsForm({ formData, setFormData, projectId }) {
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  
  // Fetch screening questions specifically for this component
  useEffect(() => {
    if (!projectId) return;
    fetchScreeningQuestions();
  }, [projectId]);
  
  const fetchScreeningQuestions = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await API.get(`/screening_question/?project_id=${projectId}`);
      
      // Check if we got valid data
      if (response.data && Array.isArray(response.data)) {
        setQuestions(response.data);
        
        // Update formData with questions from API if we have any
        if (response.data.length > 0) {
          const questionTexts = response.data.map(item => item.question || "").filter(Boolean);
          
          setFormData(prev => ({
            ...prev,
            screeningQuestions: questionTexts
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching screening questions:", error);
      // Continue using questions from main project data
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.warning("Please enter a screening question");
      return;
    }
    
    // Check for duplicates
    const isDuplicate = formData.screeningQuestions.some(
      q => q.toLowerCase() === newQuestion.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      toast.warning("This question is already added");
      return;
    }
    
    // First add to local state for immediate UI update
    setFormData(prev => ({ 
      ...prev, 
      screeningQuestions: [...prev.screeningQuestions, newQuestion.trim()] 
    }));
    
    // Then try to add to the API if we have a project ID
    if (projectId) {
      try {
        const response = await API.post('/screening_question/', {
          project_id: projectId,
          question: newQuestion.trim()
        });
        
        // Add new question to local questions state
        if (response.data) {
          setQuestions(prev => [...prev, response.data]);
        }
      } catch (error) {
        console.error("Error adding question to API:", error);
        // Question will still be saved through the main form submit
      }
    }
    
    setNewQuestion("");
  };
  
  const removeQuestion = async (index) => {
    const questionToRemove = formData.screeningQuestions[index];
    
    // Update local state immediately
    setFormData(prev => ({ 
      ...prev, 
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index) 
    }));
    
    // Try to remove from API if we have a project ID
    if (projectId) {
      try {
        // Find the question object that matches this text
        const questionObj = questions.find(q => q.question === questionToRemove);
        
        if (questionObj && questionObj.id) {
          await API.delete(`/screening_question/${questionObj.id}/`);
          
          // Update local questions state
          setQuestions(prev => prev.filter(q => q.id !== questionObj.id));
        }
      } catch (error) {
        console.error("Error removing question from API:", error);
        // Will still be removed in main form submit
      }
    }
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
          <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />Screening Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-600">Loading screening questions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newQuestion" className="font-medium text-gray-700 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-blue-600" />Add Question
              </Label>
              <div className="relative">
                <Textarea 
                  id="newQuestion" 
                  value={newQuestion} 
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter screening question..." 
                  className="min-h-24 resize-y pr-12" 
                />
                <Button 
                  type="button" 
                  onClick={addQuestion}
                  className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {formData.screeningQuestions.length > 0 ? (
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-semibold">
                    {formData.screeningQuestions.length}
                  </span>Questions Added
                </h3>
                <div className="space-y-3">
                  {formData.screeningQuestions.map((question, index) => (
                    <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm relative group">
                      <div className="flex-1">
                        <div className="text-gray-800 whitespace-pre-wrap">{question}</div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeQuestion(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-blue-200 rounded-lg bg-blue-50">
                <HelpCircle className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-600 font-medium">No screening questions added yet</p>
                <p className="text-blue-400 text-sm mt-1">Add questions to help screen candidates</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
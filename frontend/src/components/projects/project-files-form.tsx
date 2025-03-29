import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { FilePlus, FileUp, Loader2, Trash2, X } from "lucide-react";

export default function ProjectFilesForm({ formData, setFormData, projectFiles, fileUploading, deleteFile }) {
  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    
    if (!allowedTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("File type not supported. Please upload PDF, DOC, DOCX, XLS, or XLSX file.");
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size too large. Maximum allowed is 10MB.");
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      if (validateFile(files[0])) {
        setFormData(prev => ({ ...prev, file: files[0] }));
        toast.success(`File "${files[0].name}" selected successfully`);
      } else {
        e.target.value = '';
      }
    }
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>Project Files
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <div className="space-y-4">
          {/* Existing files */}
          {projectFiles.length > 0 && (
            <div className="space-y-3 mb-6">
              <Label className="font-medium text-gray-700">Existing Files</Label>
              <div className="space-y-2">
                {projectFiles.map((file, index) => (
                  <div key={file.file_id || `file-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                      <FilePlus className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-blue-700">{file.file_name}</p>
                        <p className="text-sm text-blue-500">{file.file_type?.toUpperCase()}</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteFile(file.file_id)}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload new file */}
          <div className="space-y-2">
            <Label htmlFor="file" className="font-medium text-gray-700">Upload New Document (Optional)</Label>
            {!formData.file ? (
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50 hover:bg-blue-100">
                <Input type="file" id="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
                <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="h-14 w-14 text-blue-500" />
                  <span className="text-sm text-gray-600 mt-2 font-medium">Drag and drop or click to upload</span>
                  <span className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FilePlus className="h-10 w-10 text-blue-500 mr-4" />
                <div className="flex-1">
                  <p className="font-medium text-blue-700">{formData.file.name}</p>
                  <p className="text-sm text-blue-500">{Math.round(formData.file.size / 1024)} KB</p>
                  {fileUploading && (
                    <div className="mt-2 flex items-center text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Preparing for upload...</span>
                    </div>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
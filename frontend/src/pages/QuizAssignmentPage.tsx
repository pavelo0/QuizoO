import { QuizAssignmentJournal } from '@/widgets/quiz-assignment-journal';
import { Navigate, useParams } from 'react-router-dom';

export default function QuizAssignmentPage() {
  const { assignmentId } = useParams();
  if (!assignmentId) {
    return <Navigate to="/app" replace />;
  }
  return <QuizAssignmentJournal assignmentId={assignmentId} />;
}

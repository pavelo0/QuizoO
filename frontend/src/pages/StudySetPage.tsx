import { StudySetDetailView } from '@/widgets/study-set-detail';
import { Navigate, useParams } from 'react-router-dom';

export default function StudySetPage() {
  const { setId } = useParams();
  if (!setId) {
    return <Navigate to="/app" replace />;
  }
  return <StudySetDetailView setId={setId} />;
}

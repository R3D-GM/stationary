import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) return <p className="center-msg">{t('common.loading')}</p>;
  return user ? children : <Navigate to="/login" replace />;
}

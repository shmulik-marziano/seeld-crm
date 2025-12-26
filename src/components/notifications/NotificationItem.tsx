import { useNavigate } from 'react-router-dom';
import { AlertCircle, Info, TrendingDown, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    priority: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    action_url?: string;
  };
  onRead: (id: string) => void;
  onClose: () => void;
}

const NotificationItem = ({ notification, onRead, onClose }: NotificationItemProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'policy_expiring':
        return <Clock className="text-destructive" size={20} />;
      case 'high_premium':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'savings_opportunity':
        return <TrendingDown className="text-secondary" size={20} />;
      case 'renewal_reminder':
        return <Info className="text-primary" size={20} />;
      default:
        return <Info className="text-primary" size={20} />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-r-4 border-r-destructive';
      case 'high':
        return 'border-r-4 border-r-yellow-500';
      case 'medium':
        return 'border-r-4 border-r-primary';
      default:
        return 'border-r-4 border-r-muted';
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  return (
    <div
      className={cn(
        'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
        getPriorityColor(),
        !notification.is_read && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn(
              'font-semibold text-sm',
              !notification.is_read && 'text-foreground'
            )}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: he,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;

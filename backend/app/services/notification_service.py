from ..models import db, Notification, User

class NotificationService:
    @staticmethod
    def send_notification(user_id, title, message, notif_type='complaint'):
        """Creates an in-app notification for a specific user"""
        try:
            notif = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=notif_type,
                is_read=False
            )
            db.session.add(notif)
            db.session.commit()
            
            # Note: Hook for external Push Notifications (e.g. Firebase FCM) can be dispatched here:
            # FCMService.send_push(user_id, title, message)
            
            return notif
        except Exception as e:
            db.session.rollback()
            print(f"Error sending notification to user {user_id}: {e}")
            return None

    @staticmethod
    def notify_wardens(title, message, notif_type='emergency'):
        """Broadcasts a notification to all active wardens/admins"""
        try:
            wardens = User.query.filter_by(role='warden').all()
            created_notifications = []
            for warden in wardens:
                notif = Notification(
                    user_id=warden.id,
                    title=title,
                    message=message,
                    type=notif_type,
                    is_read=False
                )
                db.session.add(notif)
                created_notifications.append(notif)
            db.session.commit()
            return created_notifications
        except Exception as e:
            db.session.rollback()
            print(f"Error broadcasting to wardens: {e}")
            return []

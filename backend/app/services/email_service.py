from flask_mail import Mail, Message
from .. import mail

def send_welcome_email(user):
    msg = Message(
        'Welcome to Creative Services Platform',
        sender='noreply@example.com',
        recipients=[user.email]
    )
    msg.body = f'''
    Welcome {user.name}!
    
    Thank you for joining our platform. We're excited to help you with your creative projects.
    
    Best regards,
    The CSP Team
    '''
    mail.send(msg)

def send_project_notification(user, project, action):
    msg = Message(
        f'Project Update: {project.title}',
        sender='noreply@example.com',
        recipients=[user.email]
    )
    msg.body = f'''
    Hi {user.name},
    
    Your project "{project.title}" has been {action}.
    
    You can check the details at: {project.url}
    
    Best regards,
    The CSP Team
    '''
    mail.send(msg) 
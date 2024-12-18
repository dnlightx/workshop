from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import bcrypt
from sqlalchemy import func, case, desc

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///taskrewards.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    coins = db.Column(db.Integer, default=0)
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tasks = db.relationship('Task', backref='user', lazy=True)
    habits = db.relationship('Habit', backref='user', lazy=True)
    rewards = db.relationship('Reward', backref='user', lazy=True)
    pomodoro_sessions = db.relationship('PomodoroSession', backref='user', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    coins_reward = db.Column(db.Integer, default=10)
    due_date = db.Column(db.DateTime)
    priority = db.Column(db.String(20), default='medium')
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    streak = db.Column(db.Integer, default=0)
    target_days = db.Column(db.Integer, default=1)
    reminder_time = db.Column(db.Time)
    last_completed = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Reward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    coins_cost = db.Column(db.Integer, nullable=False)
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PomodoroSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer, nullable=False)  # in minutes
    completed = db.Column(db.Boolean, default=False)

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Hash password
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=new_user.id)
    return jsonify({
        'token': access_token,
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email,
            'is_premium': new_user.is_premium
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_premium': user.is_premium
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Task routes
@app.route('/api/tasks', methods=['GET', 'POST'])
@jwt_required()
def handle_tasks():
    user_id = get_jwt_identity()
    
    if request.method == 'GET':
        tasks = Task.query.filter_by(user_id=user_id).all()
        return jsonify({
            'tasks': [{
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'completed': task.completed,
                'coins_reward': task.coins_reward,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'priority': task.priority,
                'category': task.category
            } for task in tasks]
        })
    
    data = request.get_json()
    new_task = Task(
        user_id=user_id,
        title=data['title'],
        description=data.get('description'),
        coins_reward=data.get('coins_reward', 10),
        due_date=datetime.fromisoformat(data['due_date']) if 'due_date' in data else None,
        priority=data.get('priority', 'medium'),
        category=data.get('category')
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({
        'id': new_task.id,
        'title': new_task.title,
        'description': new_task.description,
        'completed': new_task.completed,
        'coins_reward': new_task.coins_reward,
        'due_date': new_task.due_date.isoformat() if new_task.due_date else None,
        'priority': new_task.priority,
        'category': new_task.category
    }), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def handle_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    
    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'})
    
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.coins_reward = data.get('coins_reward', task.coins_reward)
    task.due_date = datetime.fromisoformat(data['due_date']) if 'due_date' in data else task.due_date
    task.priority = data.get('priority', task.priority)
    task.category = data.get('category', task.category)
    
    db.session.commit()
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'coins_reward': task.coins_reward,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'priority': task.priority,
        'category': task.category
    })

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    
    if task.completed:
        return jsonify({'error': 'Task already completed'}), 400
    
    task.completed = True
    user = User.query.get(user_id)
    user.coins += task.coins_reward
    
    db.session.commit()
    return jsonify({
        'message': 'Task completed successfully',
        'coins_earned': task.coins_reward
    })

# Premium upgrade route (without payment integration)
@app.route('/api/premium/upgrade', methods=['POST'])
@jwt_required()
def upgrade_to_premium():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.is_premium:
        return jsonify({'error': 'User is already premium'}), 400
    
    user.is_premium = True
    db.session.commit()
    
    return jsonify({
        'message': 'Successfully upgraded to premium',
        'is_premium': True
    })

# Pomodoro routes
@app.route('/api/pomodoro', methods=['POST', 'GET'])
@jwt_required()
def handle_pomodoro():
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        session = PomodoroSession(
            user_id=user_id,
            start_time=datetime.utcnow(),
            duration=data.get('duration', 25),  # default 25 minutes
        )
        db.session.add(session)
        db.session.commit()
        return jsonify({
            'id': session.id,
            'start_time': session.start_time.isoformat(),
            'duration': session.duration
        }), 201
    
    # Get user's pomodoro history
    sessions = PomodoroSession.query.filter_by(user_id=user_id).order_by(PomodoroSession.start_time.desc()).limit(10)
    return jsonify({
        'sessions': [{
            'id': s.id,
            'start_time': s.start_time.isoformat(),
            'end_time': s.end_time.isoformat() if s.end_time else None,
            'duration': s.duration,
            'completed': s.completed
        } for s in sessions]
    })

@app.route('/api/pomodoro/<int:session_id>/complete', methods=['POST'])
@jwt_required()
def complete_pomodoro(session_id):
    user_id = get_jwt_identity()
    session = PomodoroSession.query.filter_by(id=session_id, user_id=user_id).first_or_404()
    
    session.end_time = datetime.utcnow()
    session.completed = True
    
    # Award coins for completed session
    user = User.query.get(user_id)
    user.coins += 20  # Award 20 coins for completed pomodoro
    
    db.session.commit()
    return jsonify({'message': 'Session completed', 'coins_earned': 20})

# Habit routes
@app.route('/api/habits', methods=['GET', 'POST'])
@jwt_required()
def handle_habits():
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        habit = Habit(
            user_id=user_id,
            name=data['name'],
            description=data.get('description'),
            target_days=data.get('target_days', 1),
            reminder_time=datetime.strptime(data['reminder_time'], '%H:%M').time() if 'reminder_time' in data else None
        )
        db.session.add(habit)
        db.session.commit()
        return jsonify({
            'id': habit.id,
            'name': habit.name,
            'streak': habit.streak
        }), 201
    
    habits = Habit.query.filter_by(user_id=user_id).all()
    return jsonify({
        'habits': [{
            'id': h.id,
            'name': h.name,
            'description': h.description,
            'streak': h.streak,
            'target_days': h.target_days,
            'reminder_time': h.reminder_time.strftime('%H:%M') if h.reminder_time else None,
            'last_completed': h.last_completed.isoformat() if h.last_completed else None
        } for h in habits]
    })

@app.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
@jwt_required()
def complete_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first_or_404()
    
    now = datetime.utcnow()
    if not habit.last_completed or (now - habit.last_completed).days >= 1:
        habit.streak += 1
        habit.last_completed = now
        
        # Award coins for maintaining streak
        user = User.query.get(user_id)
        coins_earned = min(habit.streak * 5, 50)  # Max 50 coins per habit completion
        user.coins += coins_earned
        
        db.session.commit()
        return jsonify({'message': 'Habit completed', 'streak': habit.streak, 'coins_earned': coins_earned})
    
    return jsonify({'error': 'Habit already completed today'}), 400

# Reward Store routes
@app.route('/api/rewards', methods=['GET', 'POST'])
@jwt_required()
def handle_rewards():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if request.method == 'POST':
        if not user.is_premium:
            return jsonify({'error': 'Premium subscription required to create custom rewards'}), 403
        
        data = request.get_json()
        reward = Reward(
            user_id=user_id,
            name=data['name'],
            description=data.get('description'),
            coins_cost=data['coins_cost'],
            is_premium=data.get('is_premium', False)
        )
        db.session.add(reward)
        db.session.commit()
        return jsonify({
            'id': reward.id,
            'name': reward.name,
            'coins_cost': reward.coins_cost
        }), 201
    
    # Get both system rewards and user's custom rewards
    rewards = Reward.query.filter(
        (Reward.user_id == user_id) | 
        (Reward.user_id == None)  # System rewards
    ).all()
    
    return jsonify({
        'rewards': [{
            'id': r.id,
            'name': r.name,
            'description': r.description,
            'coins_cost': r.coins_cost,
            'is_premium': r.is_premium
        } for r in rewards]
    })

@app.route('/api/rewards/<int:reward_id>/redeem', methods=['POST'])
@jwt_required()
def redeem_reward(reward_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    reward = Reward.query.get_or_404(reward_id)
    
    if reward.is_premium and not user.is_premium:
        return jsonify({'error': 'Premium subscription required for this reward'}), 403
    
    if user.coins < reward.coins_cost:
        return jsonify({'error': 'Insufficient coins'}), 400
    
    user.coins -= reward.coins_cost
    db.session.commit()
    
    return jsonify({
        'message': 'Reward redeemed successfully',
        'remaining_coins': user.coins
    })

# Progress and Analytics routes
@app.route('/api/progress', methods=['GET'])
@jwt_required()
def get_progress():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Get completed tasks count for last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    daily_tasks = db.session.query(
        func.date(Task.created_at).label('date'),
        func.count(Task.id).label('count')
    ).filter(
        Task.user_id == user_id,
        Task.completed == True,
        Task.created_at >= week_ago
    ).group_by(func.date(Task.created_at)).all()
    
    # Get habit completion rate
    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_completion = {
        habit.name: (habit.streak / habit.target_days * 100) 
        for habit in habits if habit.target_days > 0
    }
    
    # Get pomodoro statistics
    pomodoro_stats = db.session.query(
        func.count(PomodoroSession.id).label('total_sessions'),
        func.sum(case((PomodoroSession.completed == True, 1), else_=0)).label('completed_sessions')
    ).filter(PomodoroSession.user_id == user_id).first()
    
    return jsonify({
        'daily_tasks': [{
            'date': str(dt.date),
            'count': dt.count
        } for dt in daily_tasks],
        'habit_completion': habit_completion,
        'pomodoro_stats': {
            'total_sessions': pomodoro_stats.total_sessions or 0,
            'completed_sessions': pomodoro_stats.completed_sessions or 0,
            'completion_rate': (pomodoro_stats.completed_sessions or 0) / (pomodoro_stats.total_sessions or 1) * 100
        },
        'total_coins_earned': user.coins
    })

# Leaderboard routes
@app.route('/api/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    timeframe = request.args.get('timeframe', 'weekly')  # weekly, monthly, all-time
    
    if timeframe == 'weekly':
        start_date = datetime.utcnow() - timedelta(days=7)
    elif timeframe == 'monthly':
        start_date = datetime.utcnow() - timedelta(days=30)
    else:
        start_date = datetime.min
    
    # Get users ranked by completed tasks and maintained streaks
    leaderboard = db.session.query(
        User.id,
        User.username,
        func.count(Task.id).label('tasks_completed'),
        func.sum(Habit.streak).label('total_streak')
    ).join(Task, Task.user_id == User.id)\
     .join(Habit, Habit.user_id == User.id)\
     .filter(
        Task.completed == True,
        Task.created_at >= start_date
     ).group_by(User.id)\
     .order_by(desc('tasks_completed'), desc('total_streak'))\
     .limit(10)\
     .all()
    
    return jsonify({
        'leaderboard': [{
            'user_id': entry.id,
            'username': entry.username,
            'tasks_completed': entry.tasks_completed,
            'total_streak': entry.total_streak
        } for entry in leaderboard]
    })

# User profile routes
@app.route('/api/user/profile', methods=['GET', 'PUT'])
@jwt_required()
def handle_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if request.method == 'GET':
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'coins': user.coins,
            'is_premium': user.is_premium,
            'created_at': user.created_at.isoformat()
        })
    
    data = request.get_json()
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        user.username = data['username']
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already taken'}), 400
        user.email = data['email']
    
    if 'current_password' in data and 'new_password' in data:
        if not bcrypt.checkpw(data['current_password'].encode('utf-8'), user.password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        user.password = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

# Leaderboard routes
@app.route('/api/leaderboard')
@jwt_required()
def get_leaderboard():
    timeframe = request.args.get('timeframe', 'weekly')
    
    if timeframe == 'weekly':
        start_date = datetime.utcnow() - timedelta(days=7)
    elif timeframe == 'monthly':
        start_date = datetime.utcnow() - timedelta(days=30)
    else:  # all-time
        start_date = datetime.min
    
    # Calculate user scores based on tasks completed and habit streaks
    users = db.session.query(
        User,
        func.count(Task.id).label('tasks_completed'),
        func.sum(case([(Habit.current_streak != None, Habit.current_streak)], else_=0)).label('total_streak')
    ).outerjoin(
        Task, db.and_(Task.user_id == User.id, Task.completed == True, Task.created_at >= start_date)
    ).outerjoin(
        Habit, Habit.user_id == User.id
    ).group_by(User.id).order_by(desc('tasks_completed'), desc('total_streak')).all()
    
    return jsonify({
        'leaderboard': [{
            'user_id': user.id,
            'username': user.username,
            'tasks_completed': tasks_completed,
            'total_streak': total_streak or 0,
            'is_premium': user.is_premium
        } for user, tasks_completed, total_streak in users]
    })

# Progress analytics routes
@app.route('/api/progress')
@jwt_required()
def get_progress():
    user_id = get_jwt_identity()
    timeframe = request.args.get('timeframe', 'weekly')
    
    if timeframe == 'weekly':
        start_date = datetime.utcnow() - timedelta(days=7)
    elif timeframe == 'monthly':
        start_date = datetime.utcnow() - timedelta(days=30)
    else:
        start_date = datetime.min
    
    # Get task completion stats
    tasks = Task.query.filter(
        Task.user_id == user_id,
        Task.created_at >= start_date
    ).all()
    
    # Get habit completion stats
    habits = Habit.query.filter_by(user_id=user_id).all()
    
    # Get pomodoro session stats
    pomodoro_sessions = PomodoroSession.query.filter(
        PomodoroSession.user_id == user_id,
        PomodoroSession.created_at >= start_date
    ).all()
    
    return jsonify({
        'tasks': {
            'total': len(tasks),
            'completed': len([t for t in tasks if t.completed]),
            'completion_rate': len([t for t in tasks if t.completed]) / len(tasks) if tasks else 0
        },
        'habits': {
            'total': len(habits),
            'active_streaks': len([h for h in habits if h.current_streak > 0]),
            'average_streak': sum(h.current_streak or 0 for h in habits) / len(habits) if habits else 0
        },
        'pomodoro': {
            'total_sessions': len(pomodoro_sessions),
            'total_minutes': sum(p.duration for p in pomodoro_sessions),
            'average_session_length': sum(p.duration for p in pomodoro_sessions) / len(pomodoro_sessions) if pomodoro_sessions else 0
        }
    })

# Initialize database
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

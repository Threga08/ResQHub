import random
import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, FeePayment, User
from ..middleware import get_current_user, role_required
from ..services import NotificationService

fees_bp = Blueprint('fees', __name__, url_prefix='/api/fees')

def generate_receipt_no():
    for _ in range(10):
        rec = f"REC-{random.randint(10000, 99999)}"
        if not FeePayment.query.filter_by(receipt_no=rec).first():
            return rec
    return f"REC-{int(time.time())}"

@fees_bp.route('/my', methods=['GET'])
@role_required('student')
def get_my_fees():
    user = get_current_user()
    fees = FeePayment.query.filter_by(student_id=user.id).order_by(FeePayment.created_at.desc()).all()
    
    total_due = sum(f.amount for f in fees if f.status != 'Paid')
    total_paid = sum(f.amount for f in fees if f.status == 'Paid')

    return jsonify({
        'fees': [f.to_dict() for f in fees],
        'total_due': round(total_due, 2),
        'total_paid': round(total_paid, 2)
    }), 200


@fees_bp.route('/pay', methods=['POST'])
@role_required('student')
def pay_fee():
    user = get_current_user()
    data = request.get_json() or {}

    fee_id = data.get('fee_id')
    payment_method = data.get('payment_method', 'UPI') # UPI, Debit Card, Net Banking

    fee = FeePayment.query.get(fee_id)
    if not fee:
        return jsonify({'error': 'Not Found', 'message': 'Fee record not found'}), 404

    if fee.student_id != user.id:
        return jsonify({'error': 'Forbidden', 'message': 'You can only pay your own dues'}), 403

    if fee.status == 'Paid':
        return jsonify({'error': 'Bad Request', 'message': 'This fee is already paid'}), 400

    try:
        fee.status = 'Paid'
        fee.paid_at = datetime.utcnow()
        fee.payment_method = payment_method
        fee.transaction_id = f"TXN-{random.randint(10000000, 99999999)}"
        db.session.commit()

        NotificationService.send_notification(
            user_id=user.id,
            title="Payment Successful",
            message=f"Received payment of INR {fee.amount:.2f} for {fee.fee_type}. Receipt #{fee.receipt_no}.",
            notif_type='system'
        )

        return jsonify({
            'message': 'Payment completed successfully',
            'fee': fee.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@fees_bp.route('', methods=['GET'])
@role_required('warden')
def get_all_fees():
    status = request.args.get('status')
    fee_type = request.args.get('fee_type')

    query = FeePayment.query
    if status:
        query = query.filter_by(status=status)
    if fee_type:
        query = query.filter_by(fee_type=fee_type)

    all_fees = FeePayment.query.all()
    total_collected = sum(f.amount for f in all_fees if f.status == 'Paid')
    total_pending = sum(f.amount for f in all_fees if f.status == 'Pending')
    total_overdue = sum(f.amount for f in all_fees if f.status == 'Overdue')
    overdue_count = sum(1 for f in all_fees if f.status == 'Overdue')

    filtered_fees = query.order_by(FeePayment.created_at.desc()).all()

    return jsonify({
        'fees': [f.to_dict() for f in filtered_fees],
        'total_collected': round(total_collected, 2),
        'total_pending': round(total_pending, 2),
        'total_overdue': round(total_overdue, 2),
        'overdue_count': overdue_count
    }), 200


@fees_bp.route('/issue', methods=['POST'])
@role_required('warden')
def issue_fee():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    fee_type = data.get('fee_type', 'Damage Penalty')
    amount = data.get('amount')
    due_date = data.get('due_date')
    notes = data.get('notes', '').strip()

    if not student_id or not amount or not due_date:
        return jsonify({'error': 'Bad Request', 'message': 'Student ID, amount, and due date are required'}), 400

    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({'error': 'Not Found', 'message': 'Valid student not found'}), 404

    try:
        receipt_no = generate_receipt_no()
        fee = FeePayment(
            receipt_no=receipt_no,
            student_id=student.id,
            fee_type=fee_type,
            amount=float(amount),
            due_date=due_date,
            status='Pending',
            notes=notes
        )
        db.session.add(fee)
        db.session.commit()

        NotificationService.send_notification(
            user_id=student.id,
            title=f"New Dues Issued: {fee_type}",
            message=f"An amount of INR {float(amount):.2f} has been issued for {fee_type}. Due on {due_date}.",
            notif_type='system'
        )

        return jsonify({'message': 'Fee issued successfully', 'fee': fee.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500

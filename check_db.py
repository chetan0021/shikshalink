import sqlite3
import os

db_path = r'c:\Users\Chetan\Documents\new software\Shiksha Link\backend\shiksha_link.db'
if not os.path.exists(db_path):
    print("Database file not found at:", db_path)
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name FROM students LIMIT 5")
        students = cursor.fetchall()
        print("Students in DB:", students)
    except Exception as e:
        print("Error reading students table:", e)
    conn.close()

# Manual test checklist

Run this against a live Firebase project, with the API and the web app both running (see "Run both servers" in the README). Use three test accounts: a teacher, a student and an admin. Each numbered step has the result you should see.

## Teacher

1. Log in as a teacher.
   - Expected: the sidebar shows **My notebook**, **Courses** and **Password**. **Users** and **Badges** are not there.
2. Open **Courses** and click **New course**. Enter a title, pick a grade and a topic, then click **Save course**.
   - Expected: the course appears under **My courses**.
3. Open the course. On the **Lessons** tab, click **Add lesson**. Enter a title, a topic and some content, then click **Save lesson**.
   - Expected: the lesson appears in the **Lessons** list.
4. Open the lesson and click **Add experiment**. Enter a title, at least one material and one step, then click **Save experiment**.
   - Expected: the experiment appears under **Experiments**.
5. On the lesson page, click **Add quiz**. Enter a title and a passing score, then click **Save quiz**.
   - Expected: the quiz appears under **Quizzes**.
6. Open the quiz and click **Add question**. Enter a question and two choices, mark one as the correct answer, then click **Save question**.
   - Expected: the question appears with a check mark next to the correct choice.
7. Add a second question the same way.
   - Expected: both questions are listed, in order.
8. Back on the course page, open the **Students** tab. Pick the student account and click **Add**.
   - Expected: the student appears in the roster.
9. Open the **Badges** tab. Pick the student, enter a badge title and click **Award badge**.
   - Expected: the badge appears in the list with the student's name and today's date.
10. Go back to **Courses**, click **Delete** on the course, then click **Yes**.
    - Expected: the course is gone from **My courses**.
11. In the Firebase console, open Firestore and check the `lessons` collection.
    - Expected: no lesson document has the deleted course's `courseId`. The experiments, quizzes, questions and enrollments for the course are gone too. The badge stays, as the spec says.

## Student

1. Log in as a student.
   - Expected: the sidebar shows **My notebook**, **Courses**, **Badges** and **Password**.
2. Open **Courses**, then the **Browse** section. Use the **Grade** filter to find the course, and click **Enroll**.
   - Expected: the course moves into the **Joined** section.
3. Click the course.
   - Expected: the course opens on the **Lessons** tab. There are no **Students** or **Badges** tabs, and no **Add lesson** button.
4. Open a lesson.
   - Expected: the lesson content and its experiment show. There is no **Edit lesson** button, and no **Add experiment** button.
5. Open the quiz from the lesson.
   - Expected: the questions and their choices show, with no check mark and no "(correct answer)" text. There are no **Add question**, **Edit** or **Delete** buttons.
6. Open **Badges** in the sidebar.
   - Expected: the badge from the teacher's step 9 is listed.
7. Go back to the course and click **Leave course**, then click **Yes**.
   - Expected: you return to **Courses**, and the course is back under **Browse**.

## Admin

1. Log in as an admin.
   - Expected: the sidebar shows **Users**. If there are pending teacher requests, it shows a count.
2. Open **Users** and click **Add a user**. Enter a name, an email, a password of at least 6 characters, and the role **Teacher**. Click **Save user**.
   - Expected: the new user appears under **All users** with the **Teacher** role.
3. Click **Edit** on a student, change the grade, and click **Save user**.
   - Expected: the change shows on that student's row.
4. Click **Turn off** on the student, then click **Yes**. Log out and try to log in as that student.
   - Expected: the button now reads **Turn on**. The login does not succeed, and the form shows "Something went wrong. Please try again."
5. Log back in as the admin, click **Turn on** on the student, then **Yes**.
   - Expected: the button reads **Turn off** again. The student can log in again.
6. Click **Delete** on a test student, then click **Yes**.
   - Expected: the row disappears. The student's enrollments are gone from the `enrollments` collection in Firestore. Courses they taught are kept.
7. Find your own row, marked with the **You** chip.
   - Expected: **Edit**, **Turn off** and **Delete** are disabled. The role menu is disabled too. Hovering over the buttons shows "You can’t change your own account here."

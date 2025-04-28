const express = require("express");
const { eq, and, desc, or, sql } = require("drizzle-orm");
const db = require("../db");
const { tasks, taskHistory } = require("../db/schema");
const authMiddleware = require("../middleware/auth");
const { producer, topics } = require("../config/kafka");

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the user
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dueDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tasks by due date
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - Low
 *             - Medium
 *             - High
 *         description: Filter tasks by priority (Low, Medium, High)
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - To Do
 *             - In Progress
 *             - Done
 *         description: Filter tasks by status (To Do, In Progress, Done)
 *     responses:
 *       200:
 *         description: List of tasks assigned or created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   status:
 *                     type: string
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                   createdBy:
 *                     type: integer
 *                   assignedTo:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { dueDate, priority, status } = req.query;

    const conditions = [
      or(
        eq(tasks.createdBy, req.user.userId),
        eq(tasks.assignedTo, req.user.userId)
      ),
    ];
    if (dueDate) {
      conditions.push(sql`DATE(${tasks.dueDate}) = ${dueDate}`);
    }
    if (priority) {
      conditions.push(eq(tasks.priority, priority));
    }
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    let query = db
      .select()
      .from(tasks)
      .where(and(...conditions));

    // Order by createdAt descending
    query = query.orderBy(desc(tasks.createdAt));

    // Execute the query and get the filtered tasks
    const userTasks = await query;

    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - priority
 *               - status
 *               - dueDate
 *               - assignedTo
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 status:
 *                   type: string
 *                 dueDate:
 *                   type: string
 *                   format: date-time
 *                 createdBy:
 *                   type: integer
 *                 assignedTo:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status } =
      req.body;

    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description,
        priority,
        status,
        dueDate: new Date(dueDate),
        createdBy: req.user.userId,
        assignedTo,
      })
      .returning();

    // Create task history entry
    await db.insert(taskHistory).values({
      taskId: newTask.id,
      changeType: "created",
      newValue: JSON.stringify(newTask),
      userId: req.user.userId,
    });

    // Send Kafka notification
    await producer.send({
      topic: topics.TASK_UPDATES,
      messages: [
        {
          value: JSON.stringify({
            type: "TASK_CREATED",
            task: newTask,
            userId: assignedTo,
            date: new Date(),
          }),
        },
      ],
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 status:
 *                   type: string
 *                 dueDate:
 *                   type: string
 *                   format: date-time
 *                 createdBy:
 *                   type: integer
 *                 assignedTo:
 *                   type: integer
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.dueDate && typeof updates.dueDate === "string") {
      updates.dueDate = new Date(updates.dueDate);
    }
    // Get current task state
    const [currentTask] = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update task
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Create task history entry
    await db.insert(taskHistory).values({
      taskId: id,
      changeType: "updated",
      previousValue: JSON.stringify(currentTask),
      newValue: JSON.stringify(updatedTask),
      userId: req.user.userId,
    });

    // Send Kafka notification
    await producer.send({
      topic: topics.TASK_UPDATES,
      messages: [
        {
          value: JSON.stringify({
            type: "TASK_UPDATED",
            task: updatedTask,
            userId: updatedTask.assignedTo,
            date: new Date(),
          }),
        },
      ],
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the task to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get task before deletion
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete task
    await db.delete(tasks).where(eq(tasks.id, id));

    // Create task history entry
    await db.insert(taskHistory).values({
      taskId: id,
      changeType: "deleted",
      previousValue: JSON.stringify(task),
      userId: req.user.userId,
    });

    // Send Kafka notification
    await producer.send({
      topic: topics.TASK_UPDATES,
      messages: [
        {
          value: JSON.stringify({
            type: "TASK_DELETED",
            taskId: id,
            userId: task.assignedTo,
            date: new Date(),
          }),
        },
      ],
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}/history:
 *   get:
 *     summary: Get task history
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the task to get the history of
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   taskId:
 *                     type: integer
 *                   changeType:
 *                     type: string
 *                     description: Type of change (created, updated, deleted)
 *                   previousValue:
 *                     type: string
 *                     nullable: true
 *                   newValue:
 *                     type: string
 *                     nullable: true
 *                   userId:
 *                     type: integer
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const history = await db
      .select()
      .from(taskHistory)
      .where(eq(taskHistory.taskId, id))
      .orderBy(desc(taskHistory.timestamp));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

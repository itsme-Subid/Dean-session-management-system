import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

// route for testing
router.get("/", async (_: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

// route for register for student and dean
router.post("/register", async (req: Request, res: Response) => {
  const {
    universityId,
    password,
    role,
  }: {
    universityId: string;
    password: string;
    role: string;
  } = req.body;
  const prisma = new PrismaClient();
  try {
    if (role.toLowerCase() === "student") {
      const student = await prisma.student.create({
        data: {
          universityId,
          password,
        },
      });
      res.json(student);
    } else if (role.toLowerCase() === "dean") {
      const dean = await prisma.dean.create({
        data: {
          universityId,
          password,
        },
      });
      res.json(dean);
    } else {
      res.json({ message: "Invalid role" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

// route for login for student and dean
router.post("/login", async (req: Request, res: Response) => {
  const {
    universityId,
    password,
  }: {
    universityId: string;
    password: string;
  } = req.body;
  const prisma = new PrismaClient();
  try {
    const student = await prisma.student.findUnique({
      where: {
        universityId,
      },
    });
    const dean = await prisma.dean.findUnique({
      where: {
        universityId,
      },
    });
    if (student) {
      if (student.password === password) {
        req.headers.authorization = student.id;
        res.json({ token: student.id });
      } else {
        res.json({ message: "Invalid password" });
      }
    } else if (dean) {
      if (dean.password === password) {
        req.headers.authorization = dean.id;
        res.json({ token: dean.id });
      } else {
        res.json({ message: "Invalid password" });
      }
    } else {
      res.json({ message: "Invalid university ID" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

// route for student to see free sessions
router.get("/sessions/free", async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  const { authorization } = req.headers;
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: authorization,
      },
    });
    if (student) {
      const deans = await prisma.dean.findMany();
      const deansIds = deans.map((dean) => dean.id);
      const sessions = await prisma.session.findMany({
        where: {
          deanId: {
            notIn: deansIds,
          },
          endTime: {
            gt: new Date(),
          },
        },
      });
      res.json(sessions);
    } else {
      res.json({ message: "Invalid token" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

// route for student to see free sessions
router.get("/sessions/students", async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  const { authorization } = req.headers;
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: authorization,
      },
    });
    if (student) {
      const sessions = await prisma.session.findMany({
        where: {
          studentId: student.id,
          endTime: {
            gt: new Date(),
          },
        },
      });
      res.json(sessions);
    } else {
      res.json({ message: "Invalid token" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

// route for dean to see pending sessions
router.get("/sessions/deans", async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  const { authorization } = req.headers;
  try {
    const dean = await prisma.dean.findUnique({
      where: {
        id: authorization,
      },
    });
    if (dean) {
      const sessions = await prisma.session.findMany({
        where: {
          deanId: dean.id,
          endTime: {
            gt: new Date(),
          },
        },
      });
      res.json(sessions);
    } else {
      res.json({ message: "Invalid token" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

// route for student to book a session
router.post("/sessions/book", async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  const { authorization } = req.headers;
  const {
    deanId,
    startTime,
    endTime,
  }: {
    deanId: string;
    startTime: Date;
    endTime: Date;
  } = req.body;
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: authorization,
      },
    });
    if (student) {
      const session = await prisma.session.create({
        data: {
          startTime,
          endTime,
          studentId: student.id,
          deanId,
        },
      });
      res.json(session);
    } else {
      res.json({ message: "Invalid token" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

// route for dean to see pending sessions
router.get("/sessions/pending", async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  const { authorization } = req.headers;
  try {
    const dean = await prisma.dean.findUnique({
      where: {
        id: authorization,
      },
    });
    if (dean) {
      const sessions = await prisma.session.findMany({
        where: {
          deanId: dean.id,
          endTime: {
            gt: new Date(),
          },
        },
      });
      res.json(sessions);
    } else {
      res.json({ message: "Invalid token" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

export default router;

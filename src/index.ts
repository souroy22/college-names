import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/dbConfig";
import csv from "csv-parser";
import { Readable } from "stream";
import multer from "multer";
import College from "./models/collegeModel";

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();
const PORT = process.env.PORT || "8000";
const app = express();
app.set("port", PORT);

declare global {
  namespace Express {
    interface Request {
      user: Record<string, any>;
      token: string | null;
    }
  }
}

app.use(express.json());
app.use(cors());
app.use(cookieParser());

connectDB();

app.get("/", (_: Request, res: Response) => {
  return res.status(200).json({ msg: "Sucessfully running" });
});

// app.post(
//   "/upload-csv",
//   upload.single("file"),
//   async (req: Request, res: Response) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send("No file uploaded.");
//       }
//       if (!req.file.originalname.endsWith(".csv")) {
//         return res.status(400).send("Only CSV file is allowed.");
//       }

//       const fileInfo = {
//         filename: req.file.originalname,
//         path: req.file.path,
//         uploadDate: new Date(),
//       };

//       if (!fileInfo) {
//         return res.status(404).send("File not found.");
//       }

//       const data: any = [];
//       const readableFileStream = new Readable();
//       readableFileStream.push(req.file.buffer);
//       readableFileStream.push(null);
//       readableFileStream
//         .pipe(csv())
//         .on("data", (row) => {
//           data.push(row);
//         })
//         .on("end", async () => {
//           //   const rows: { collegeName: string }[] = [];
//           //   for (let row of data) {
//           //     rows.push({ collegeName: row.LocationName });
//           //   }
//           let batchSize = 1000;
//           for (let i = 0; i < data.length; i += batchSize) {
//             const bulkData = data.slice(i, i + batchSize);
//             // console.log("bulkData", bulkData);
//             await College.insertMany(bulkData);
//           }
//           return res
//             .status(200)
//             .json({ msg: "All colleges added successfully" });
//         });
//     } catch (error) {
//       if (error instanceof Error) {
//         console.log(`Error: ${error.message}`);
//         return res.status(500).json({ error: "Something went wrong!" });
//       }
//     }
//   }
// );

app.get("/colleges", async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 100,
      sortBy = "collegeName",
      sortOrder = null,
      searchValue = "",
    } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Build the search query
    const searchQuery = searchValue
      ? {
          $or: [
            { college: { $regex: searchValue, $options: "i" } },
            { state: { $regex: searchValue, $options: "i" } },
            { district: { $regex: searchValue, $options: "i" } },
          ],
        }
      : {};

    let sortQuery: {} = sortOrder ? { [sortBy as string]: sortDirection } : {};

    // Fetch data with pagination, sorting, and searching
    const colleges = await College.find(searchQuery, { _id: 1, college: 1 })
      .sort(sortQuery)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Get the total count of documents that match the search query
    const totalColleges = await College.countDocuments(searchQuery);

    // Respond with the data and pagination info
    res.status(200).json({
      data: colleges,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalColleges / limitNumber),
      totalItems: totalColleges,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
      return res.status(500).json({ error: "Something went wrong!" });
    }
  }
});

app.listen(parseInt(PORT, 10), `0.0.0.0`, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

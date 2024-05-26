"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dbConfig_1 = __importDefault(require("./db/dbConfig"));
const multer_1 = __importDefault(require("multer"));
const collegeModel_1 = __importDefault(require("./models/collegeModel"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
dotenv_1.default.config();
const PORT = process.env.PORT || "8000";
const app = (0, express_1.default)();
app.set("port", PORT);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
(0, dbConfig_1.default)();
app.get("/", (_, res) => {
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
app.get("/colleges", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 100, sortBy = "collegeName", sortOrder = null, searchValue = "", } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
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
        let sortQuery = sortOrder ? { [sortBy]: sortDirection } : {};
        // Fetch data with pagination, sorting, and searching
        const colleges = yield collegeModel_1.default.find(searchQuery, { _id: 1, college: 1 })
            .sort(sortQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        // Get the total count of documents that match the search query
        const totalColleges = yield collegeModel_1.default.countDocuments(searchQuery);
        // Respond with the data and pagination info
        res.status(200).json({
            data: colleges,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalColleges / limitNumber),
            totalItems: totalColleges,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(`Error: ${error.message}`);
            return res.status(500).json({ error: "Something went wrong!" });
        }
    }
}));
app.listen(parseInt(PORT, 10), `0.0.0.0`, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schema for College document
const collegeNameSchema = new mongoose_1.Schema({
    university: { type: String, trim: true },
    college: { type: String, trim: true },
    college_type: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
}, { timestamps: true });
// Model for College document
const College = (0, mongoose_1.model)("College", collegeNameSchema);
exports.default = College;
//# sourceMappingURL=collegeModel.js.map
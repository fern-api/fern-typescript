import { ErrorContext } from "./ErrorContext";

export interface GeneratedError {
    writeToFile: (context: ErrorContext) => void;
}

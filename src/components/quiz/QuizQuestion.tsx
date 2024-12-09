import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { QuizFormValues } from "@/types/quiz";

interface QuizQuestionProps {
  form: UseFormReturn<QuizFormValues>;
  questionIndex: number;
  onRemove: () => void;
  onAddOption: () => void;
}

export const QuizQuestion = ({ 
  form, 
  questionIndex, 
  onRemove,
  onAddOption 
}: QuizQuestionProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium">Question {questionIndex + 1}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.question`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question Text</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your question" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-4 space-y-4">
        <Label>Options</Label>
        {form.watch(`questions.${questionIndex}.options`).map((_, optionIndex) => (
          <FormField
            key={optionIndex}
            control={form.control}
            name={`questions.${questionIndex}.options.${optionIndex}`}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                <RadioGroup
                  value={form.watch(`questions.${questionIndex}.correctAnswer`).toString()}
                  onValueChange={(value) => {
                    form.setValue(`questions.${questionIndex}.correctAnswer`, parseInt(value));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={optionIndex.toString()} id={`correct-${questionIndex}-${optionIndex}`} />
                    <Label htmlFor={`correct-${questionIndex}-${optionIndex}`}>Correct</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddOption}
          className="mt-2"
        >
          Add Option
        </Button>
      </div>
    </div>
  );
};
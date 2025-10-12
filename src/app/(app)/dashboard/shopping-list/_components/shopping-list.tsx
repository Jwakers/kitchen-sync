import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useShare from "@/lib/hooks/use-share";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Printer,
  Share2,
  ShoppingCart,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ShoppingListItem } from "./types";

interface ShoppingListProps {
  allIngredients: ShoppingListItem[];
  setAllIngredients: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  checkedItems: Set<string>;
  setCheckedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFinalised: boolean;
  setIsFinalised: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
  onBack: () => void;
  onDone: () => void;
}

export default function ShoppingList({
  allIngredients,
  setAllIngredients,
  checkedItems,
  setCheckedItems,
  isFinalised,
  setIsFinalised,
  onConfirm,
  onDone,
  onBack,
}: ShoppingListProps) {
  const { canShare, copyToClipboard, share } = useShare();

  const handleAmountChange = (id: string, newAmount: number) => {
    setAllIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: Math.max(0, newAmount) } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setAllIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckItem = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEdit = () => {
    setIsFinalised(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    // Create a formatted text version of the shopping list
    const listText = `Created: ${new Date().toLocaleDateString()}\n\n${allIngredients
      .map((item) => {
        const checked = checkedItems.has(item.id) ? "✓ " : "";
        const amt = item.amount != null ? String(item.amount) : "";
        const unit = item.unit ? ` ${item.unit}` : "";
        const space = amt || unit ? " " : "";
        return `${checked}• ${amt}${unit}${space}${item.name}`;
      })
      .join("\n")}`;

    // Check if Web Share API is available (primarily mobile)
    if (canShare) {
      await share("Shopping List", listText);
      toast.success("Shopping list shared successfully!");
    } else {
      // Fallback to clipboard
      await copyToClipboard(listText);
    }
  };

  return (
    <>
      {/* Print-only section */}
      <div className="hidden print:block">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
          <div className="space-y-1">
            {allIngredients.map((item) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2 border-b"
                >
                  <div className="w-5 h-5 border-2 rounded flex-shrink-0 mt-0.5">
                    {isChecked && (
                      <div className="w-full h-full flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={isChecked ? "line-through" : ""}>
                      {item.name}
                    </span>
                    <span className="ml-2">
                      {item.amount ?? ""} {item.unit ?? ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm mt-8">Total items: {allIngredients.length}</p>
        </div>
      </div>

      {/* Screen view */}
      <div className="space-y-6 print:hidden">
        {/* Back/Edit Button */}
        {!isFinalised ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe Selection
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit Shopping List
          </Button>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">
                  {isFinalised ? "Your Shopping List" : "Review Shopping List"}
                </h3>
              </div>
              <Badge variant="outline" className="text-sm">
                {allIngredients.length} items
              </Badge>
            </div>

            {/* Shopping guidance for finalized lists */}
            {isFinalised && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Ready to shop! Here&apos;s how to use your list:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Use in the app</p>
                      <p className="text-muted-foreground">
                        Check off items as you shop. Your progress is saved
                        automatically.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Print it out</p>
                      <p className="text-muted-foreground">
                        Get a clean, printer-friendly version to take to the
                        store.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Share as text</p>
                      <p className="text-muted-foreground">
                        Send to family, save as a note, or share via text
                        message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {allIngredients.map((item) => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isFinalised && isChecked
                        ? "bg-muted/50 opacity-60"
                        : "hover:bg-muted/30 hover:border-primary/30"
                    }`}
                  >
                    {/* Checkbox (only in finalized state) */}
                    {isFinalised && (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCheckItem(item.id)}
                        className="h-5 w-5"
                      />
                    )}

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-medium capitalize ${
                            isFinalised && isChecked ? "line-through" : ""
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>

                      {/* Amount Display/Controls */}
                      {isFinalised ? (
                        // Static display when finalized
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.amount ?? ""} {item.unit ?? ""}
                        </p>
                      ) : (
                        // Editable controls before finalized
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-muted rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={isNaN(Number(item.amount))}
                              onClick={() => {
                                if (isNaN(Number(item.amount))) return;
                                handleAmountChange(
                                  item.id,
                                  (item.amount as number) - 1
                                );
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={
                                typeof item.amount === "number"
                                  ? item.amount
                                  : ""
                              }
                              min={0}
                              step={1}
                              onChange={(e) =>
                                handleAmountChange(
                                  item.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-7 w-16 text-center border-0 bg-transparent p-0 text-sm font-medium"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={isNaN(Number(item.amount))}
                              onClick={() => {
                                if (isNaN(Number(item.amount))) return;
                                handleAmountChange(
                                  item.id,
                                  (item.amount as number) + 1
                                );
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.unit ?? ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Remove Button (only in editing state) */}
                    {!isFinalised && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove {item.name}</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {allIngredients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  All items removed. Go back to select recipes again.
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Action Buttons */}
            {isFinalised ? (
              // Final state: Print, Share, Done
              <div className="flex gap-2 flex-wrap sticky bottom-nav">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print List
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button className="w-full sm:w-auto sm:flex-1" onClick={onDone}>
                  <Check className="h-4 w-4 mr-2" />
                  Done Shopping
                </Button>
              </div>
            ) : (
              // Editing state: Confirm/Save
              <div className="flex gap-2 sticky bottom-nav">
                <Button variant="outline" className="flex-1" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={onConfirm}
                  disabled={allIngredients.length === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Shopping List
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

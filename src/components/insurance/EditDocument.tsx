
import React, { useState } from "react";
import { InsuranceDocument, InsuranceType } from "../../contexts/InsuranceContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface EditDocumentProps {
  document: InsuranceDocument;
  onSave: (updatedDoc: Partial<InsuranceDocument>) => void;
  onCancel: () => void;
}

const EditDocument: React.FC<EditDocumentProps> = ({ document, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: document.name,
    type: document.type,
    policyNumber: document.policyNumber,
    provider: document.provider,
    premium: document.premium,
    dueDate: document.dueDate,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      type: value as InsuranceType,
      name: `${value} Insurance`
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Insurance Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Auto">Auto</SelectItem>
            <SelectItem value="Life">Life</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Document Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          name="provider"
          value={formData.provider}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="policyNumber">Policy Number</Label>
        <Input
          id="policyNumber"
          name="policyNumber"
          value={formData.policyNumber}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="premium">Premium</Label>
        <Input
          id="premium"
          name="premium"
          value={formData.premium}
          onChange={handleInputChange}
          placeholder="e.g. $150/month"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditDocument;

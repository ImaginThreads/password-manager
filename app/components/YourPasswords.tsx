import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dummyPasswords = [
  { id: 1, website: "example.com", username: "johndoe" },
  { id: 2, website: "anothersite.com", username: "janesmith" },
];

export function YourPasswords() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Passwords</CardTitle>
        <CardDescription>Manage your saved passwords</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Website</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyPasswords.map((password) => (
              <TableRow key={password.id}>
                <TableCell>{password.website}</TableCell>
                <TableCell>{password.username}</TableCell>
                <TableCell>
                  {/* Add actions like view, edit, delete */}
                  View | Edit | Delete
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

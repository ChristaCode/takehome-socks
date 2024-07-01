import express, { Request, Response } from 'express';

// Queue class for handling email data
class Queue<T> {
    private items: T[] = [];
    
    enqueue(item: T) {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

const app = express();
const port = 3000;

// Define email data structure
interface EmailDataStructure {
    subject: string;
    emailBody: string;
    timeDelay: number;
}

// Define flow data structure
interface FlowDataStructure {
    eventNameTrigger: string;
    userEmail: string;
    emails: Queue<EmailDataStructure>; // allows for multiple emails in a flow, each with its own time delay and queued in order
}

// Provided sendEmail function, included arguments for userEmail, subject, and emailBody
const sendEmail = async (userEmail: string, subject: string, emailBody: string): Promise<boolean> => {
    // Generate a random number between 0 and 1
    const randomNumber = Math.random();
    
    // Simulating an asynchronous operation, e.g., sending an email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 95% chance to return true, 5% chance to return false - emails fail
    return randomNumber < 0.95
}

// Function for processing email queue associated with flow
const processEmailQueue = async (flowData: FlowDataStructure) => {
    const { userEmail, emails } = flowData;
    while (!emails.isEmpty()) {
        const emailData = emails.dequeue();
        if (!emailData) {
            return;
        }
        // If there is a time delay associated with the email, wait before sending the email. Assuming user sends the time delay in seconds
        await new Promise(resolve => setTimeout(resolve, emailData.timeDelay * 1000));
        // Send email, included arguments for email subject and body
        const emailSent = await sendEmail(userEmail, emailData.subject, emailData.emailBody);
        if (!emailSent) {
            console.error('Error sending email:', emailData);
        }
    }
}

// Setting up express
app.use(express.json());

// Express endpoint for receiving new email requests
app.post('/trigger-emails', (req: Request, res: Response) => {
    const { eventNameTrigger, userEmail, emails } = req.body; // Assuming the user is sending in the email data in the request body

    // Check that the user has sent all required fields for creating a new flow
    if (!eventNameTrigger || !userEmail || !emails) {
        return res.status(400).send('Invalid request payload');
    }

    // Initialize a new queue for this incoming flow
    const emailQueue = new Queue<EmailDataStructure>();

    // Queue each email individually
    for (const email of emails) {
        emailQueue.enqueue(email);
    }
    const flowData: FlowDataStructure = {
        eventNameTrigger,
        userEmail,
        emails: emailQueue
    };

    // Process the email queue for this flow
    processEmailQueue(flowData);

    res.send('Emails queued successfully');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

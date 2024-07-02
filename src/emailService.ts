import express, { Request, Response } from 'express';
import { sendEmail } from './sendEmail';

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
app.post('/trigger-emails', async (req: Request, res: Response) => {
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
    await processEmailQueue(flowData);

    res.send('Emails queued successfully');
});

export default app;
export { sendEmail }; // Export sendEmail for testing purposes

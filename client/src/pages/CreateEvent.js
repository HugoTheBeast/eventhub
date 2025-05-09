import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../contexts/AuthContext';
import { createEvent } from '../services/EventService';
import { toast } from 'react-toastify';

const CreateEvent = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user || !user.is_organizer) {
        navigate('/');
        return null;
    }

    const initialValues = {
        title: '',
        description: '',
        date: '',
        location: '',
        max_seats: ''
    };

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string(),
        date: Yup.date().required('Date is required'),
        location: Yup.string().required('Location is required'),
        max_seats: Yup.number().required('Number of seats is required').min(1)
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await createEvent(values, token);
            toast.success('Event created successfully!');
            navigate('/events');
        } catch (error) {
            toast.error('Failed to create event');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label className="block">Title</label>
                            <Field type="text" name="title" className="w-full p-2 border rounded" />
                            <ErrorMessage name="title" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label className="block">Description</label>
                            <Field as="textarea" name="description" className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block">Date and Time</label>
                            <Field type="datetime-local" name="date" className="w-full p-2 border rounded" />
                            <ErrorMessage name="date" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label className="block">Location</label>
                            <Field type="text" name="location" className="w-full p-2 border rounded" />
                            <ErrorMessage name="location" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label className="block">Maximum Seats</label>
                            <Field type="number" name="max_seats" className="w-full p-2 border rounded" />
                            <ErrorMessage name="max_seats" component="div" className="text-red-500" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white p-2 rounded">
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateEvent;
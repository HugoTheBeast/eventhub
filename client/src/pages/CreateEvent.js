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
        max_seats: '',
        category: '', // Now required
        price: ''    // Now required
    };

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string(),
        date: Yup.date()
            .required('Date is required')
            .min(new Date(), 'Date must be in the future'),
        location: Yup.string().required('Location is required'),
        max_seats: Yup.number()
            .required('Number of seats is required')
            .min(1, 'Must have at least 1 seat'),
        category: Yup.string().required('Category is required'),
        price: Yup.number()
            .required('Price is required')
            .min(0, 'Price cannot be negative')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const eventData = {
                ...values,
                max_seats: parseInt(values.max_seats),
                price: parseFloat(values.price)
            };
            await createEvent(eventData, token);
            toast.success('Event created successfully!');
            navigate('/events');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create event');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        'Music', 'Sports', 'Food', 'Arts',
        'Business', 'Technology', 'Education', 'Other'
    ];

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
                        {/* Title Field */}
                        <div>
                            <label className="block">Title*</label>
                            <Field type="text" name="title" className="w-full p-2 border rounded" />
                            <ErrorMessage name="title" component="div" className="text-red-500" />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block">Description</label>
                            <Field as="textarea" name="description" className="w-full p-2 border rounded" />
                        </div>

                        {/* Date Field */}
                        <div>
                            <label className="block">Date and Time*</label>
                            <Field type="datetime-local" name="date" className="w-full p-2 border rounded" />
                            <ErrorMessage name="date" component="div" className="text-red-500" />
                        </div>

                        {/* Location Field */}
                        <div>
                            <label className="block">Location*</label>
                            <Field type="text" name="location" className="w-full p-2 border rounded" />
                            <ErrorMessage name="location" component="div" className="text-red-500" />
                        </div>

                        {/* Max Seats Field */}
                        <div>
                            <label className="block">Maximum Seats*</label>
                            <Field type="number" name="max_seats" min="1" className="w-full p-2 border rounded" />
                            <ErrorMessage name="max_seats" component="div" className="text-red-500" />
                        </div>

                        {/* Category Field */}
                        <div>
                            <label className="block">Category*</label>
                            <Field as="select" name="category" className="w-full p-2 border rounded">
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="category" component="div" className="text-red-500" />
                        </div>

                        {/* Price Field */}
                        <div>
                            <label className="block">Price*</label>
                            <Field 
                                type="number" 
                                name="price" 
                                min="0" 
                                step="0.01" 
                                className="w-full p-2 border rounded" 
                            />
                            <ErrorMessage name="price" component="div" className="text-red-500" />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateEvent;
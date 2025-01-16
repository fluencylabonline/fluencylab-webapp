import React, { FC } from 'react';
import { FaRegCalendarCheck, FaRegCalendarMinus, FaRegCalendarTimes } from 'react-icons/fa';

interface ClassDateItemProps {
    date: Date;
    status: string;
    onDone: () => void;
    onCancel: () => void;
    onDelete: () => void;
}

const ClassDateItem: FC<ClassDateItemProps> = ({ date, status, onDone, onCancel, onDelete }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Feita':
                return 'text-fluency-green-500 bg-fluency-green-500';
            case 'Cancelada':
                return 'text-yellow-500 bg-fluency-yellow-500';
            case 'À Fazer':
                return 'text-fluency-blue-600 bg-fluency-blue-500';
            case 'Atrasada':
                return 'text-fluency-red-600 bg-fluency-red-500';
            default:
                return '';
        }
    };

    return (
        <div className="flex flex-row gap-2 items-center justify-center">
            <div className="group cursor-pointer relative inline-block text-center">
                <p className={`flex flex-row font-semibold gap-1 p-1 px-2 rounded-lg text-sm ${getStatusStyles(status).split(' ')[0]}`}>
                    {`${new Intl.DateTimeFormat('pt-PT', { weekday: 'short' })
                        .format(date)
                        .replace(/^\w/, (c) => c.toUpperCase())}, ${date.getDate()}`}
                </p>
                <div
                    className={`!text-white font-bold opacity-0 transition-all duration-500 ease-in-out w-28 text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none ${
                        getStatusStyles(status).split(' ')[1]
                    }`}
                >
                    {status}
                </div>
            </div>
            <button
                className="text-white flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-[4px] font-bold bg-fluency-blue-600 hover:bg-opacity-100 transition-all duration-300 ease-in-out dark:bg-fluency-blue-600"
                onClick={onDone}
            >
                <p className="lg:block md:block hidden">Feita</p>
                <FaRegCalendarCheck className="icon" />
            </button>
            <button
                className="text-white flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-[4px] font-bold bg-fluency-yellow-600 hover:bg-opacity-100 transition-all duration-300 ease-in-out dark:bg-fluency-yellow-600"
                onClick={onCancel}
            >
                <p className="lg:block md:block hidden">Cancelar</p>
                <FaRegCalendarTimes className="icon" />
            </button>
            <button
                className="text-white  flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-[4px] font-bold bg-fluency-red-600 hover:bg-opacity-100 transition-all duration-300 ease-in-out dark:bg-fluency-red-600"
                onClick={onDelete}
            >
                <p className="lg:block md:block hidden">Deletar</p>
                <FaRegCalendarMinus className="icon" />
            </button>
        </div>
    );
};

export default ClassDateItem;
